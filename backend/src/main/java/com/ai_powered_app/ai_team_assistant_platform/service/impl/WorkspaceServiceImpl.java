package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
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
}
