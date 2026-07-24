package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import com.ai_powered_app.ai_team_assistant_platform.enums.AuthProvider;
import com.ai_powered_app.ai_team_assistant_platform.enums.PlatformRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.DuplicateResourceException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.WorkspaceRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AdminService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final WorkspaceRepository workspaceRepository;

    public AdminServiceImpl(PasswordEncoder passwordEncoder, UserRepository userRepository, WorkspaceRepository workspaceRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
    }

    @Override
    public UserResponse registerAdmin(UserRegistrationRequest userRegistrationRequest) {

        if(userRepository.existsByEmail(userRegistrationRequest.getEmail())){
            throw new DuplicateResourceException(
                    "A user with email '" + userRegistrationRequest.getEmail() + "' already exists");
        }

        if(userRepository.existsByPlatformRole(PlatformRole.SUPER_ADMIN)){
            throw new DuplicateResourceException(
                    "A super admin already exists.");
        }

        User user = new User();
        user.setEmail(userRegistrationRequest.getEmail());
        user.setName(userRegistrationRequest.getName());
        user.setPassword(passwordEncoder.encode(userRegistrationRequest.getPassword()));
        user.setPlatformRole(PlatformRole.SUPER_ADMIN);
        user.setProvider(AuthProvider.LOCAL);
        user.setDesignation(userRegistrationRequest.getDesignation());
        User savedUser = userRepository.save(user);

        return getUserResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {

        User currentUser = getAuthenticateUser();

        if(currentUser.getPlatformRole() != PlatformRole.SUPER_ADMIN){
            throw new DuplicateResourceException(
                    "Only super admin allowed.");
        }

        List<User> allUsers = userRepository.findByPlatformRole(PlatformRole.Standard_Member);

        return allUsers.stream().map(AdminServiceImpl::getUserResponse).toList();
    }

    @Override
    public List<WorkspaceResponse> getAllWorkspace() {

        User currentUser = getAuthenticateUser();

        if(currentUser.getPlatformRole() != PlatformRole.SUPER_ADMIN){
            throw new DuplicateResourceException(
                    "Only super admin allowed.");
        }

        List<Workspace> allWorkspace = workspaceRepository.findAll();

        return allWorkspace.stream().map(AdminServiceImpl::getWorkspaceResponse).toList();
    }

    @Override
    public void blockUser(Long userId) {
        User currentUser = getAuthenticateUser();

        if(currentUser.getPlatformRole() != PlatformRole.SUPER_ADMIN){
            throw new DuplicateResourceException(
                    "Only super admin allowed.");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with this id."));
        user.setIsActive(false);

        userRepository.save(user);
    }

    private static WorkspaceResponse getWorkspaceResponse(Workspace savedWorkspace) {
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
        return response;
    }

    private static UserResponse getUserResponse(User savedUser) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setName(savedUser.getName());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setProvider(savedUser.getProvider());
        userResponse.setProfileImage(savedUser.getProfileImage());
        userResponse.setDesignation(savedUser.getDesignation());
        userResponse.setPlatformRole(savedUser.getPlatformRole());
        userResponse.setIsActive(savedUser.getIsActive());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());
        return userResponse;
    }
    private User getAuthenticateUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
