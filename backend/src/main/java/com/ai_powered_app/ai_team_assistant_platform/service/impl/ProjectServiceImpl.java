package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import com.ai_powered_app.ai_team_assistant_platform.entity.WorkspaceMember;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.ProjectRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceMemberRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

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

    @Override
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

        return getProjectResponse(savedProject);
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
