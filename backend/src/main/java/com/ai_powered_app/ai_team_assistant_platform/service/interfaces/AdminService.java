package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;

import java.util.List;

public interface AdminService {
    UserResponse registerAdmin(UserRegistrationRequest userRegistrationRequest);
    List<UserResponse> getAllUsers();
    List<WorkspaceResponse> getAllWorkspace();
    void blockUser(Long userId);
}
