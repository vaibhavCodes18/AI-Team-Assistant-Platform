package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectMemberRole;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectMemberResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.entity.ProjectMember;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import com.ai_powered_app.ai_team_assistant_platform.entity.WorkspaceMember;
import com.ai_powered_app.ai_team_assistant_platform.entity.ActivityLog;
import com.ai_powered_app.ai_team_assistant_platform.entity.Notification;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.enums.NotificationType;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectRole;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectStatus;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.ProjectRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceMemberRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.ActivityLogRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.NotificationRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.ProjectMemberRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ProjectService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest projectRequest) {

        User currentUser = getAuthenticateUser();

        Workspace workspace = workspaceRepository.findById(projectRequest.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException(
                    "You do not have permission to create this project only OWNER or ADMIN can create this project");
        }

        Project project = setProject(projectRequest, workspace, currentUser);
        Project savedProject = projectRepository.save(project);

        ProjectMember projectMember = new ProjectMember();
        projectMember.setProject(savedProject);
        projectMember.setUser(currentUser);
        projectMember.setRole(ProjectRole.PROJECT_ADMIN);
        projectMemberRepository.save(projectMember);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(workspace);
        activityLog.setUser(currentUser);
        activityLog.setAction("PROJECT_CREATED");
        activityLog.setEntityType("PROJECT");
        activityLog.setEntityId(savedProject.getId());
        activityLog.setMetadata(currentUser.getName() + " created project " + savedProject.getName());
        activityLogRepository.save(activityLog);

        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspace.getId());
        List<Notification> notifications = new ArrayList<>();
        for (WorkspaceMember workspaceMember : members) {
            if (workspaceMember.getRole().equals(WorkspaceRole.OWNER) || workspaceMember.getRole().equals(WorkspaceRole.ADMIN)) {
                Notification notification = new Notification();
                notification.setRecipient(workspaceMember.getUser());
                notification.setTitle("New Project Created");
                notification.setMessage("A new project '" + savedProject.getName() + "' has been created in workspace "
                        + workspace.getName() + " by " + currentUser.getName());
                notification.setType(NotificationType.PROJECT_CREATED);
                notification.setIsRead(false);
                notifications.add(notification);
            }
        }
        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }

        return getProjectResponse(savedProject);
    }

    @Override
    public ProjectResponse getProjectById(Long projectId) {
        User currentUser = getAuthenticateUser();
        boolean isAuthorized = false;

        Project project = projectRepository.findByIdAndStatusNot(projectId, ProjectStatus.ARCHIVED)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceAndUser(project.getWorkspace(), currentUser)
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (workspaceMember.getRole() == WorkspaceRole.OWNER ||
                workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            isAuthorized = true;
        } else {
            if (projectMemberRepository.existsByProjectIdAndUserId(projectId, currentUser.getId())) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadCredentialsException("You are not authorized to remove member from this project");
        }

        return getProjectResponse(project);
    }

    @Override
    public List<ProjectResponse> getWorkspaceProjects(Long workspaceId) {
        User currentUser = getAuthenticateUser();

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        List<Project> projects;
        if (workspaceMember.getRole() == WorkspaceRole.OWNER ||
                workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            projects = projectRepository.findByWorkspaceIdAndStatusNotOrderByUpdatedAtDesc(workspaceId,
                    ProjectStatus.ARCHIVED);
        } else {
            projects = projectRepository.findAccessibleProjects(currentUser.getId(), workspaceId,
                    ProjectStatus.ARCHIVED);
        }

        return projects.stream().map(this::getProjectResponse).collect(Collectors.toList());
    }

    @Override
    public List<ProjectMemberResponse> getProjectMembers(Long projectId) {
        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        boolean isAuthorized = false;

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceAndUser(project.getWorkspace(), currentUser)
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (workspaceMember.getRole() == WorkspaceRole.OWNER ||
                workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            isAuthorized = true;
        } else {
            if (projectMemberRepository.existsByProjectIdAndUserId(projectId, currentUser.getId())) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadCredentialsException("You are not authorized to get members of this project");
        }

        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);

        return projectMembers.stream().map(this::getProjectMemberResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<ProjectMemberResponse> inviteUserToProject(Long projectId, List<String> emails) {
        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceAndUser(project.getWorkspace(), currentUser)
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        boolean isAuthorized = false;
        if (workspaceMember.getRole() == WorkspaceRole.OWNER || workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            isAuthorized = true;
        } else {
            Optional<ProjectMember> projectMemberOpt = projectMemberRepository.findByProjectIdAndUserId(projectId,
                    currentUser.getId());
            if (projectMemberOpt.isPresent() && projectMemberOpt.get().getRole() == ProjectRole.PROJECT_ADMIN) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadCredentialsException("You are not authorized to invite user to this project");
        }

        List<ProjectMember> members = new ArrayList<>();
        for (String email : emails) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

            if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(project.getWorkspace().getId(), user.getId())) {
                throw new BadCredentialsException("User is not a member of this workspace");
            }

            if (projectMemberRepository.existsByProjectIdAndUserId(project.getId(), user.getId())) {
                throw new BadCredentialsException("User is already a member of this project");
            }

            ProjectMember projectMember = new ProjectMember();
            projectMember.setProject(project);
            projectMember.setUser(user);
            projectMember.setRole(ProjectRole.CONTRIBUTOR);

            members.add(projectMember);

            ActivityLog activityLog = new ActivityLog();
            activityLog.setWorkspace(project.getWorkspace());
            activityLog.setUser(currentUser);
            activityLog.setAction("USER_ADDED_TO_PROJECT");
            activityLog.setEntityType("PROJECT");
            activityLog.setEntityId(project.getId());
            activityLog.setMetadata(
                    currentUser.getName() + " added user " + user.getName() + " to project " + project.getName());
            activityLogRepository.save(activityLog);

            Notification notification = new Notification();
            notification.setRecipient(user);
            notification.setTitle("Added to Project");
            notification
                    .setMessage("You have been added to project " + project.getName() + " by " + currentUser.getName());
            notification.setType(NotificationType.PROJECT_UPDATED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
        List<ProjectMember> savedMembers = projectMemberRepository.saveAll(members);

        return savedMembers.stream().map(this::getProjectMemberResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeMemberFromProject(Long projectId, Long userId) {
        User currentUser = getAuthenticateUser();

        boolean isAuthorized = false;

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceAndUser(project.getWorkspace(), currentUser)
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        User memberToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (workspaceMember.getRole() == WorkspaceRole.OWNER ||
                workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            isAuthorized = true;
        } else {
            ProjectMember projectMember = projectMemberRepository
                    .findByProjectIdAndUserId(projectId, currentUser.getId())
                    .orElseThrow(() -> new BadCredentialsException("Project member not found"));
            if (projectMember.getRole() == ProjectRole.PROJECT_ADMIN) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadCredentialsException("You are not authorized to remove member from this project");
        }

        if (userId == currentUser.getId()) {
            throw new BadCredentialsException("You cannot remove yourself from the project");
        }

        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new BadCredentialsException("User is not a member of this project");
        }

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(workspaceMember.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("MEMBER_REMOVED");
        activityLog.setEntityType("PROJECT_MEMBER");
        activityLog.setEntityId(memberToRemove.getId());
        activityLog.setMetadata(memberToRemove.getName() + " removed by " + currentUser.getName());
        activityLogRepository.save(activityLog);

        Notification notification = new Notification();

        notification.setRecipient(memberToRemove);
        notification.setTitle("Member removed from project");
        notification.setMessage("You have been removed from project " + project.getName()
                + " by " + currentUser.getName());
        notification.setType(NotificationType.MEMBER_REMOVED);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    @Override
    public ProjectMemberResponse changeProjectMemberRole(Long projectId, Long userId,
            UpdateProjectMemberRole updateProjectMemberRole) {
        User currentUser = getAuthenticateUser();

        if(updateProjectMemberRole.getProjectRole() == null && updateProjectMemberRole.getProjectRole().name().isEmpty()){
            throw new BadCredentialsException("Project role is required");
        }

        ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found"));
        Project project = projectMember.getProject();

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceAndUser(project.getWorkspace(), currentUser)
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        User memberToChange = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (memberToChange.getId() == currentUser.getId()) {
            throw new BadCredentialsException("You cannot change your own role");
        }

        if (workspaceMember.getRole() == WorkspaceRole.OWNER || workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            projectMember.setRole(updateProjectMemberRole.getProjectRole());
        } else {
            if (projectMember.getRole() == ProjectRole.PROJECT_ADMIN) {
                projectMember.setRole(updateProjectMemberRole.getProjectRole());
            }
        }

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(workspaceMember.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("MEMBER_ROLE_UPDATED");
        activityLog.setEntityType("PROJECT_MEMBER");
        activityLog.setEntityId(memberToChange.getId());
        activityLog.setMetadata(memberToChange.getName() + " role updated by " + currentUser.getName());
        activityLogRepository.save(activityLog);

        Notification notification = new Notification();
        notification.setRecipient(memberToChange);
        notification.setTitle("Member role updated");
        notification.setMessage("Your role in project " + project.getName() + " has been updated by " + currentUser.getName());
        notification.setType(NotificationType.MEMBER_UPDATED);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        ProjectMember updatedMember = projectMemberRepository.save(projectMember);
        return getProjectMemberResponse(updatedMember);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, UpdateProjectRequest updateProjectRequest) {
        User currentUser = getAuthenticateUser();
        boolean isAuthorized = false;

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() == WorkspaceRole.OWNER || member.getRole() == WorkspaceRole.ADMIN) {
            isAuthorized = true;
        } else {
            ProjectMember projectMember = projectMemberRepository
                    .findByProjectIdAndUserId(projectId, currentUser.getId())
                    .orElseThrow(() -> new BadCredentialsException("Project member not found"));
            if (projectMember.getRole() == ProjectRole.PROJECT_ADMIN) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadCredentialsException("You are not authorized to update project");
        }

        if (updateProjectRequest.getName() != null && !updateProjectRequest.getName().isEmpty()) {
            project.setName(updateProjectRequest.getName());
        }
        if (updateProjectRequest.getDescription() != null && !updateProjectRequest.getDescription().isEmpty()) {
            project.setDescription(updateProjectRequest.getDescription());
        }
        if (updateProjectRequest.getStatus() != null && !updateProjectRequest.getStatus().name().isEmpty()) {
            project.setStatus(updateProjectRequest.getStatus());
        }
        if (updateProjectRequest.getStartDate() != null && !updateProjectRequest.getStartDate().toString().isEmpty()) {
            project.setStartDate(updateProjectRequest.getStartDate());
        }
        if (updateProjectRequest.getDeadline() != null && !updateProjectRequest.getDeadline().toString().isEmpty()) {
            project.setDeadline(updateProjectRequest.getDeadline());
        }
        Project updatedProject = projectRepository.save(project);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(updatedProject.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("PROJECT_UPDATED");
        activityLog.setEntityType("PROJECT");
        activityLog.setEntityId(updatedProject.getId());
        activityLog.setMetadata(currentUser.getName() + " updated project " + updatedProject.getName());
        activityLogRepository.save(activityLog);

        for (ProjectMember projectMember : projectMembers) {
            Notification notification = new Notification();
            notification.setRecipient(projectMember.getUser());
            notification.setTitle("Project updated");
            notification.setMessage(
                    "Project " + updatedProject.getName() + " has been updated by " + currentUser.getName());
            notification.setType(NotificationType.PROJECT_UPDATED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }

        List<WorkspaceMember> members = workspaceMemberRepository
                .findByWorkspaceId(updatedProject.getWorkspace().getId());
        for (WorkspaceMember workspaceMember : members) {
            if (workspaceMember.getRole() != WorkspaceRole.OWNER && workspaceMember.getRole() != WorkspaceRole.ADMIN) {
                continue;
            }
            Notification notification = new Notification();
            notification.setRecipient(workspaceMember.getUser());
            notification.setTitle("Project updated");
            notification.setMessage(
                    "Project " + updatedProject.getName() + " has been updated by " + currentUser.getName());
            notification.setType(NotificationType.PROJECT_UPDATED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }

        return getProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        User currentUser = getAuthenticateUser();
        boolean isAuthorized = false;

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        List<ProjectMember> projectMembers = projectMemberRepository.findByProjectId(projectId);
        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() == WorkspaceRole.OWNER || member.getRole() == WorkspaceRole.ADMIN) {
            isAuthorized = true;
        } else {
            ProjectMember projectMember = projectMemberRepository
                    .findByProjectIdAndUserId(projectId, currentUser.getId())
                    .orElseThrow(() -> new BadCredentialsException("Project member not found"));
            if (projectMember.getRole() == ProjectRole.PROJECT_ADMIN) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            throw new BadCredentialsException("You are not authorized to delete project");
        }

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(project.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("PROJECT_DELETED");
        activityLog.setEntityType("PROJECT");
        activityLog.setEntityId(project.getId());
        activityLog.setMetadata(currentUser.getName() + " deleted project " + project.getName());
        activityLogRepository.save(activityLog);

        for (ProjectMember projectMember : projectMembers) {
            Notification notification = new Notification();
            notification.setRecipient(projectMember.getUser());
            notification.setTitle("Project deleted");
            notification.setMessage("Project " + project.getName() + " has been deleted by " + currentUser.getName());
            notification.setType(NotificationType.PROJECT_UPDATED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }

        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(project.getWorkspace().getId());
        for (WorkspaceMember workspaceMember : members) {
            if (workspaceMember.getRole() != WorkspaceRole.OWNER && workspaceMember.getRole() != WorkspaceRole.ADMIN) {
                continue;
            }
            Notification notification = new Notification();
            notification.setRecipient(workspaceMember.getUser());
            notification.setTitle("Project deleted");
            notification.setMessage("Project " + project.getName() + " has been deleted by " + currentUser.getName());
            notification.setType(NotificationType.PROJECT_DELETED);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }

        project.setStatus(ProjectStatus.ARCHIVED);
        projectRepository.save(project);
    }

    private Project setProject(ProjectRequest projectRequest, Workspace workspace, User currentUser) {
        Project project = new Project();
        project.setName(projectRequest.getName());
        project.setWorkspace(workspace);
        project.setCreatedBy(currentUser);

        if (projectRequest.getDescription() != null) {
            project.setDescription(projectRequest.getDescription());
        }

        if (projectRequest.getStatus() != null) {
            project.setStatus(projectRequest.getStatus());
        } else {
            project.setStatus(ProjectStatus.ACTIVE);
        }
        if (projectRequest.getStartDate() != null) {
            project.setStartDate(projectRequest.getStartDate());
        } else {
            project.setStartDate(LocalDate.now());
        }
        if (projectRequest.getDeadline() != null) {
            project.setDeadline(projectRequest.getDeadline());
        }
        return project;
    }

    private ProjectMemberResponse getProjectMemberResponse(ProjectMember projectMember) {
        return ProjectMemberResponse.builder()
                .id(projectMember.getId())
                .projectId(projectMember.getProject().getId())
                .user(getUserResponse(projectMember.getUser()))
                .role(projectMember.getRole())
                .build();
    }

    private UserResponse getUserResponse(User user) {
        if (user == null)
            return null;
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .provider(user.getProvider())
                .profileImage(user.getProfileImage())
                .platformRole(user.getPlatformRole())
                .designation(user.getDesignation())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private ProjectResponse getProjectResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .workspaceId(project.getWorkspace().getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .createdById(project.getCreatedBy().getId())
                .startDate(project.getStartDate())
                .deadline(project.getDeadline())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    private User getAuthenticateUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
