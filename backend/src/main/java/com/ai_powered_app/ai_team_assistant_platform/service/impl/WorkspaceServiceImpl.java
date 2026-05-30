package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceMemberRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRoleUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceMemberResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import com.ai_powered_app.ai_team_assistant_platform.entity.WorkspaceMember;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceMemberRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.WorkspaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkspaceServiceImpl implements WorkspaceService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;


    @Override
    public WorkspaceResponse createWorkspace(WorkspaceRequest workspaceRequest) {

        Workspace workspace = new Workspace();
        workspace.setName(workspaceRequest.getName());
        workspace.setSlug(workspaceRequest.getSlug());
        workspace.setDescription(workspaceRequest.getDescription());
        workspace.setOwner(getAuthenticateUser());
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

        return getWorkspaceResponse(savedWorkspace);
    }

    @Override
    public WorkspaceResponse getWorkspaceById(Long workspaceId) {

        User user = getAuthenticateUser();

        Workspace workspace = workspaceRepository.findById(workspaceId).orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        if(!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), user.getId())){
            throw new BadCredentialsException("You are not a member of this workspace");
        }

        return getWorkspaceResponse(workspace);

    }

    @Override
    public WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceUpdateRequest request) {
        User user = getAuthenticateUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), user.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("You do not have permission to update this workspace");
        }

        if (request.getName() != null) {
            workspace.setName(request.getName());
        }
        if (request.getSlug() != null) {
            workspace.setSlug(request.getSlug());
        }
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }
        if (request.getLogoUrl() != null) {
            workspace.setLogoUrl(request.getLogoUrl());
        }
        if (request.getIsActive() != null) {
            workspace.setIsActive(request.getIsActive());
        }

        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return getWorkspaceResponse(savedWorkspace);
    }

    private WorkspaceResponse getWorkspaceResponse(Workspace savedWorkspace) {
        WorkspaceResponse response = new WorkspaceResponse();
        response.setId(savedWorkspace.getId());
        response.setName(savedWorkspace.getName());
        response.setSlug(savedWorkspace.getSlug());
        response.setDescription(savedWorkspace.getDescription());
        response.setOwnerId(savedWorkspace.getOwner().getId());
        response.setLogoUrl(savedWorkspace.getLogoUrl());
        response.setIsActive(savedWorkspace.getIsActive());
        response.setCreatedAt(savedWorkspace.getCreatedAt());
        response.setUpdatedAt(savedWorkspace.getUpdatedAt());
        return response;
    }

    private User getAuthenticateUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }

    @Override
    public void deleteWorkspace(Long workspaceId) {
        User user = getAuthenticateUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
                
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, user.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));
                
        if (member.getRole() != WorkspaceRole.OWNER) {
            throw new BadCredentialsException("Only the OWNER can delete the workspace");
        }
        
        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);
        workspaceMemberRepository.deleteAll(members);
        
        workspaceRepository.delete(workspace);
    }
    
    @Override
    public WorkspaceMemberResponse inviteMember(Long workspaceId, WorkspaceMemberRequest request) {
        User currentUser = getAuthenticateUser();
        
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
                
        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));
                
        if (currentMember.getRole() != WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("Only OWNER or ADMIN can invite members");
        }
        
        User userToInvite = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        if (workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, request.getUserId())) {
            throw new IllegalArgumentException("User is already a member of this workspace");
        }
        
        WorkspaceMember newMember = new WorkspaceMember();
        newMember.setWorkspace(workspace);
        newMember.setUser(userToInvite);
        newMember.setRole(request.getRole());
        newMember.setInvitedBy(currentUser);
        newMember.setJoinedAt(LocalDateTime.now());
        
        WorkspaceMember savedMember = workspaceMemberRepository.save(newMember);
        return getWorkspaceMemberResponse(savedMember);
    }
    
    @Override
    public void removeMember(Long workspaceId, Long userId) {
        User currentUser = getAuthenticateUser();
        
        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));
                
        if (currentMember.getRole() != WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.ADMIN) {
            throw new BadCredentialsException("Only OWNER or ADMIN can remove members");
        }
        
        WorkspaceMember memberToRemove = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));
                
        if (memberToRemove.getRole() == WorkspaceRole.OWNER && currentMember.getRole() != WorkspaceRole.OWNER) {
            throw new BadCredentialsException("ADMIN cannot remove an OWNER");
        }
        
        workspaceMemberRepository.delete(memberToRemove);
    }
    
    @Override
    public WorkspaceMemberResponse updateMemberRole(Long workspaceId, Long userId, WorkspaceRoleUpdateRequest request) {
        User currentUser = getAuthenticateUser();
        
        WorkspaceMember currentMember = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));
                
        if (currentMember.getRole() != WorkspaceRole.OWNER) {
            throw new BadCredentialsException("Only OWNER can update member roles");
        }
        
        WorkspaceMember memberToUpdate = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in workspace"));
                
        memberToUpdate.setRole(request.getRole());
        WorkspaceMember updatedMember = workspaceMemberRepository.save(memberToUpdate);
        
        return getWorkspaceMemberResponse(updatedMember);
    }
    
    @Override
    public List<WorkspaceMemberResponse> getWorkspaceMembers(Long workspaceId) {
        User currentUser = getAuthenticateUser();
        
        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new BadCredentialsException("You are not a member of this workspace");
        }
        
        List<WorkspaceMember> members = workspaceMemberRepository.findByWorkspaceId(workspaceId);
        return members.stream().map(this::getWorkspaceMemberResponse).collect(Collectors.toList());
    }

    private UserResponse getUserResponse(User user) {
        if (user == null) return null;
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
        if (member == null) return null;
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
