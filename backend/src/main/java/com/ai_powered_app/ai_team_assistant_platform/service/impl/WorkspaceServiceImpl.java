package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.*;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ActivityLogResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceMemberResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.enums.NotificationType;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.WorkspaceRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.WorkspaceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceServiceImpl implements WorkspaceService {

    private final UserRepository userRepository;

    private final WorkspaceRepository workspaceRepository;

    private final WorkspaceMemberRepository workspaceMemberRepository;

    private final WorkspaceRedisService redisService;

    private final ActivityLogRepository activityLogRepository;

    private final NotificationRepository notificationRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final AIRequestRepository aiRequestRepository;
    private final DocumentRepository documentRepository;

    @Override
    public WorkspaceResponse createWorkspace(WorkspaceRequest workspaceRequest) {

        User currentUser = getAuthenticateUser();

        Workspace workspace = new Workspace();
        workspace.setName(workspaceRequest.getName());
        workspace.setSlug(workspaceRequest.getSlug());
        workspace.setDescription(workspaceRequest.getDescription());
        workspace.setOwner(currentUser);
        workspace.setLogoUrl(workspaceRequest.getLogoUrl());
        workspace.setIsActive(true);

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMember workspaceMember = new WorkspaceMember();
        workspaceMember.setWorkspace(savedWorkspace);
        workspaceMember.setUser(getAuthenticateUser());
        workspaceMember.setRole(WorkspaceRole.OWNER);
        workspaceMember.setInvitedBy(getAuthenticateUser());
        workspaceMember.setJoinedAt(LocalDateTime.now());

        workspaceMemberRepository.save(workspaceMember);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(savedWorkspace);
        activityLog.setUser(currentUser);
        activityLog.setAction("WORKSPACE_CREATED");
        activityLog.setEntityType("WORKSPACE");
        activityLog.setEntityId(savedWorkspace.getId());
        activityLog.setMetadata(currentUser.getName() + " created workspace " + savedWorkspace.getName());

        activityLogRepository.save(activityLog);

        return getWorkspaceResponse(savedWorkspace);
    }

    @Override
    public WorkspaceResponse getWorkspaceById(Long workspaceId) {

        User user = getAuthenticateUser();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new BadCredentialsException("You are not a member of this workspace");
        }

        WorkspaceResponse cached = redisService.getRedisWorkspace(workspaceId);

        if (cached != null) {
            System.out.println(cached.getName());
            return cached;
        }

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceResponse response = getWorkspaceResponse(workspace);
        redisService.saveRedisWorkspace(workspaceId, response, Duration.ofMinutes(30L));

        return response;
    }

    @Override
    public List<WorkspaceResponse> getMyWorkspaces() {
        User loggedInUser = getAuthenticateUser();
        List<WorkspaceMember> workspaceMembers = workspaceMemberRepository.findByUser(loggedInUser);
        List<Workspace> workspaces = new ArrayList<>();
        for (WorkspaceMember workspaceMember : workspaceMembers) {
            Workspace workspace = workspaceMember.getWorkspace();
            workspaces.add(workspace);
        }
        return workspaces.stream().map(this::getWorkspaceResponse).toList();
    }

    @Override
    public WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceUpdateRequest request) {
        User user = getAuthenticateUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), user.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("You do not have permission to update this workspace only OWNER or ADMIN can update this workspace");
        }

        if (request.getName() != null && request.getName() != "") {
            workspace.setName(request.getName());
        }
        if (request.getSlug() != null && request.getSlug() != "") {
            workspace.setSlug(request.getSlug());
        }
        if (request.getDescription() != null && request.getDescription() != "") {
            workspace.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null && request.getLogoUrl() != "") {
            workspace.setLogoUrl(request.getLogoUrl());
        }
        if (request.getIsActive() != null) {
            workspace.setIsActive(request.getIsActive());
        }
        Workspace savedWorkspace = workspaceRepository.save(workspace);
        WorkspaceResponse response = getWorkspaceResponse(savedWorkspace);
        redisService.saveRedisWorkspace(workspaceId, response, Duration.ofMinutes(30L));

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(savedWorkspace);
        activityLog.setUser(user);
        activityLog.setAction("WORKSPACE_UPDATED");
        activityLog.setEntityType("WORKSPACE");
        activityLog.setEntityId(savedWorkspace.getId());
        activityLog.setMetadata("Workspace details updated");

        activityLogRepository.save(activityLog);

        return getWorkspaceResponse(savedWorkspace);
    }

    @Override
    @Transactional
    public void deleteWorkspace(Long workspaceId) {
        User user = getAuthenticateUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (workspaceMember.getRole() != WorkspaceRole.OWNER) {
            throw new BadCredentialsException("Only the OWNER can delete the workspace");
        }

        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);
        List<Project> projects = projectRepository.findByWorkspaceId(workspaceId);
        List<AIRequest> aiRequests = aiRequestRepository.findByWorkspaceId(workspaceId);
        List<Document> documents = documentRepository.findByWorkspaceId(workspaceId);
        List<Task> tasks = taskRepository.findByWorkspaceId(workspaceId);
        List<ActivityLog> activityLogs = activityLogRepository.findByWorkspaceId(workspaceId);

        workspaceMemberRepository.deleteAll(members);
        projectRepository.deleteAll(projects);
        aiRequestRepository.deleteAll(aiRequests);
        documentRepository.deleteAll(documents);
        taskRepository.deleteAll(tasks);
        activityLogRepository.deleteAll(activityLogs);
        taskRepository.deleteAll(tasks);

        List<Notification> notifications = new ArrayList<>();

        for (WorkspaceMember member : members) {
            Notification notification = new Notification();

            notification.setRecipient(member.getUser());
            notification.setTitle("Workspace Deleted");
            notification.setMessage(workspace.getName()
                    + " has been deleted by "
                    + user.getName());
            notification.setType(NotificationType.WORKSPACE_DELETED);
            notification.setIsRead(false);

            notifications.add(notification);
        }

        notificationRepository.saveAll(notifications);

        workspaceRepository.delete(workspace);
    }

    @Override
    @Transactional
    public WorkspaceMemberResponse inviteMember(Long workspaceId, WorkspaceMemberRequest request) {
        User currentUser = getAuthenticateUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));

        WorkspaceMember currentMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (currentMember.getRole() != WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("Only OWNER or ADMIN can invite members");
        }

        User userToInvite = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userToInvite.getId())) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }

        WorkspaceMember newMember = new WorkspaceMember();
        newMember.setWorkspace(workspace);
        newMember.setUser(userToInvite);
        newMember.setRole(request.getRole());
        newMember.setInvitedBy(currentUser);
        newMember.setJoinedAt(LocalDateTime.now());

        WorkspaceMember savedMember = workspaceMemberRepository.save(newMember);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(workspace);
        activityLog.setUser(currentUser);
        activityLog.setAction("MEMBER_INVITED");
        activityLog.setEntityType("WORKSPACE_MEMBER");
        activityLog.setEntityId(savedMember.getId());
        activityLog
                .setMetadata(currentUser.getName() + " added " + userToInvite.getName() + " as " + request.getRole());
        activityLogRepository.save(activityLog);

        Notification notification = new Notification();

        notification.setRecipient(savedMember.getUser());
        notification.setTitle("Member invited");
        notification.setMessage("You have been added to " + workspace.getName() + " workspace.");
        notification.setType(NotificationType.MEMBER_INVITED);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        return getWorkspaceMemberResponse(savedMember);
    }

    @Override
    @Transactional
    public void removeMember(Long workspaceId, Long userId) {
        User currentUser = getAuthenticateUser();

        WorkspaceMember currentMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (currentMember.getRole() != WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("Only OWNER or ADMIN can remove members");
        }

        WorkspaceMember memberToRemove = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));

        if (memberToRemove.getRole() == WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.OWNER) {
            throw new BadCredentialsException("ADMIN cannot remove an OWNER");
        }

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(currentMember.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("MEMBER_REMOVED");
        activityLog.setEntityType("WORKSPACE_MEMBER");
        activityLog.setEntityId(memberToRemove.getId());
        activityLog.setMetadata(memberToRemove.getUser().getName() + " removed by " + currentUser.getName());
        activityLogRepository.save(activityLog);

        Notification notification = new Notification();

        notification.setRecipient(memberToRemove.getUser());
        notification.setTitle("Member removed");
        notification.setMessage("You have been removed from workspace " + currentMember.getWorkspace().getName()
                + " by " + currentUser.getName());
        notification.setType(NotificationType.MEMBER_REMOVED);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        workspaceMemberRepository.delete(memberToRemove);
    }

    @Override
    @Transactional
    public WorkspaceMemberResponse updateMemberRole(Long workspaceId, Long userId, WorkspaceRoleUpdateRequest request) {
        User currentUser = getAuthenticateUser();

        WorkspaceMember currentMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (currentMember.getRole() != WorkspaceRole.OWNER) {
            throw new BadCredentialsException("Only OWNER can update member roles");
        }

        WorkspaceMember memberToUpdate = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));

        memberToUpdate.setRole(request.getRole());
        WorkspaceMember updatedMember = workspaceMemberRepository.save(memberToUpdate);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(currentMember.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("MEMBER_ROLE_CHANGED");
        activityLog.setEntityType("WORKSPACE_MEMBER");
        activityLog.setEntityId(updatedMember.getId());
        activityLog.setMetadata(updatedMember.getUser().getName() + " role changed by " + currentUser.getName() + " to "
                + request.getRole());
        activityLogRepository.save(activityLog);

        Notification notification = new Notification();

        notification.setRecipient(updatedMember.getUser());
        notification.setTitle("Member role changed");
        notification.setMessage("Your role has changed to " + request.getRole());
        notification.setType(NotificationType.MEMBER_ROLE_UPDATED);
        notification.setIsRead(false);
        notificationRepository.save(notification);

        return getWorkspaceMemberResponse(updatedMember);
    }

    @Override
    public List<WorkspaceMemberResponse> getWorkspaceMembers(Long workspaceId) {
        User currentUser = getAuthenticateUser();

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new BadCredentialsException("You are not a member of this workspace");
        }

        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);
        return members.stream().map(this::getWorkspaceMemberResponse).toList();
    }

    @Override
    public List<ActivityLogResponse> getWorkspaceActivityLogs(Long workspaceId) {
        User currentUser = getAuthenticateUser();

        WorkspaceMember currentMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (currentMember.getRole() != WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("Only OWNER or ADMIN can access logs");
        }

        List<ActivityLog> activityLogs = activityLogRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

        return activityLogs.stream().map(this::mapToActivityLogResponse).toList();
    }

    private ActivityLogResponse mapToActivityLogResponse(ActivityLog activityLog) {
        return ActivityLogResponse.builder()
                .id(activityLog.getId())
                .workspaceId(activityLog.getWorkspace().getId())
                .userId(activityLog.getUser().getId())
                .action(activityLog.getAction())
                .entityType(activityLog.getEntityType())
                .entityId(activityLog.getEntityId())
                .metadata(activityLog.getMetadata())
                .createdAt(activityLog.getCreatedAt())
                .build();
    }

    private WorkspaceResponse getWorkspaceResponse(Workspace savedWorkspace) {
        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(savedWorkspace.getId());
        Set<User> users = members.stream().map(WorkspaceMember::getUser).collect(Collectors.toSet());
        WorkspaceResponse response = new WorkspaceResponse();
        response.setId(savedWorkspace.getId());
        response.setName(savedWorkspace.getName());
        response.setSlug(savedWorkspace.getSlug());
        response.setDescription(savedWorkspace.getDescription());
        response.setOwner(getUserResponse(savedWorkspace.getOwner()));
        response.setLogoUrl(savedWorkspace.getLogoUrl());
        response.setIsActive(savedWorkspace.getIsActive());
        response.setCreatedAt(savedWorkspace.getCreatedAt());
        response.setUpdatedAt(savedWorkspace.getUpdatedAt());

        response.setWorkspaceMembers(users.stream().map(this::getUserResponse).collect(Collectors.toSet()));
        return response;
    }

    private User getAuthenticateUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email." + email));
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
                .designation(user.getDesignation())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private WorkspaceMemberResponse getWorkspaceMemberResponse(WorkspaceMember member) {
        if (member == null)
            return null;
        return WorkspaceMemberResponse.builder()
                .id(member.getId())
                .workspaceId(member.getWorkspace().getId())
                .user(getUserResponse(member.getUser()))
                .role(member.getRole())
                .invitedBy(getUserResponse(member.getInvitedBy()))
                .joinedAt(member.getJoinedAt())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
