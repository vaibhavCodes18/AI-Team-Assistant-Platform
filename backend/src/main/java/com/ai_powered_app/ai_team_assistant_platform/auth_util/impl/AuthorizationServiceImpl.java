package com.ai_powered_app.ai_team_assistant_platform.auth_util.impl;

import com.ai_powered_app.ai_team_assistant_platform.auth_util.interfaces.AuthorizationService;
import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.entity.ProjectMember;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.WorkspaceMember;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectRole;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.ProjectMemberRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationServiceImpl implements AuthorizationService {

    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public AuthorizationServiceImpl(ProjectMemberRepository projectMemberRepository, UserRepository userRepository) {
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public boolean isUserAuthorizedAdmin(WorkspaceMember workspaceMember, User currentUser, Project project,
                                         ProjectMember projectMember) {
        if (workspaceMember.getRole() == WorkspaceRole.OWNER || workspaceMember.getRole() == WorkspaceRole.ADMIN || (projectMember != null && projectMember.getRole() == ProjectRole.PROJECT_ADMIN)) {
            return true;
        }
        return false;
    }

    @Override
    public boolean isUserAuthorizedMember(WorkspaceMember workspaceMember, User currentUser, Project project) {
        if (workspaceMember.getRole() == WorkspaceRole.OWNER || workspaceMember.getRole() == WorkspaceRole.ADMIN || projectMemberRepository.existsByProjectIdAndUserId(project.getId(),
                currentUser.getId())) {
            return true;
        }
        return false;
    }

    public User getAuthenticateUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Auth user email: " + email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
