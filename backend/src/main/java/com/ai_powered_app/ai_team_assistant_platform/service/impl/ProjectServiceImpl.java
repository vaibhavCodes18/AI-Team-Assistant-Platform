package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import com.ai_powered_app.ai_team_assistant_platform.entity.WorkspaceMember;
import com.ai_powered_app.ai_team_assistant_platform.entity.ActivityLog;
import com.ai_powered_app.ai_team_assistant_platform.entity.Notification;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.enums.NotificationType;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.ProjectRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceMemberRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.ActivityLogRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.NotificationRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ProjectService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
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

    @Override
    @Transactional
    public ProjectResponse createProject(ProjectRequest projectRequest) {

        User currentUser = getAuthenticateUser();

        Workspace workspace = workspaceRepository.findById(projectRequest.getWorkspaceId()).orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("You do not have permission to create this project");
        }

        Project project = setProject(projectRequest, workspace, currentUser);
        Project savedProject = projectRepository.save(project);

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
            if (!workspaceMember.getUser().getId().equals(currentUser.getId())) {
                Notification notification = new Notification();
                notification.setUser(workspaceMember.getUser());
                notification.setTitle("New Project Created");
                notification.setMessage("A new project '" + savedProject.getName() + "' has been created in workspace " + workspace.getName() + " by " + currentUser.getName());
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

        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if(!workspaceMemberRepository.existsByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())){
            throw new BadCredentialsException("You are not a member of this workspace");
        }

        return getProjectResponse(project);
    }

    @Override
    public List<ProjectResponse> getWorkspaceProjects(Long workspaceId) {
        User currentUser = getAuthenticateUser();
        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        if(!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())){
            throw new BadCredentialsException("You are not a member of this workspace");
        }

        List<Project> allProjects = projectRepository.findByWorkspaceId(workspace.getId());

        return allProjects.stream().map(this::getProjectResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(Long projectId, UpdateProjectRequest updateProjectRequest) {
        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if(member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN){
            throw new BadCredentialsException("Only OWNER or ADMIN can update project");
        }

        if(updateProjectRequest.getName() != null){
            project.setName(updateProjectRequest.getName());
        }
        if(updateProjectRequest.getDescription() != null){
            project.setDescription(updateProjectRequest.getDescription());
        }
        if(updateProjectRequest.getStatus() != null){
            project.setStatus(updateProjectRequest.getStatus());
        }
        if(updateProjectRequest.getStartDate() != null){
            project.setStartDate(updateProjectRequest.getStartDate());
        }
        if(updateProjectRequest.getDeadline() != null){
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

        return getProjectResponse(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long projectId) {
        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if(member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN){
            throw new BadCredentialsException("Only OWNER or ADMIN can delete project");
        }

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(project.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("PROJECT_DELETED");
        activityLog.setEntityType("PROJECT");
        activityLog.setEntityId(project.getId());
        activityLog.setMetadata(currentUser.getName() + " deleted project " + project.getName());
        activityLogRepository.save(activityLog);

        projectRepository.delete(project);
    }


    private Project setProject(ProjectRequest projectRequest, Workspace workspace, User currentUser) {
        Project project = new Project();
        project.setName(projectRequest.getName());
        project.setWorkspace(workspace);
        project.setCreatedBy(currentUser);

        if(projectRequest.getDescription() != null){
            project.setDescription(projectRequest.getDescription());
        }

        if(projectRequest.getStatus() != null){
            project.setStatus(projectRequest.getStatus());
        }

        if(projectRequest.getStartDate() != null){
            project.setStartDate(projectRequest.getStartDate());
        }

        if(projectRequest.getDeadline() != null){
            project.setDeadline(projectRequest.getDeadline());
        }
        return project;
    }

    private ProjectResponse getProjectResponse(Project project){
        return ProjectResponse.builder()
                .id(project.getId())
                .workspaceId(project.getWorkspace().getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .createdById(project.getCreatedBy().getId())
                .startDate(project.getStartDate())
                .deadline(project.getDeadline())
                .build();
    }

    private User getAuthenticateUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
