package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.UserRegistrationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> registerAdmin(@Valid @RequestBody UserRegistrationRequest userRegistrationRequest){
        UserResponse savedAdmin = adminService.registerAdmin(userRegistrationRequest);

        ApiResponse<UserResponse> res = new ApiResponse<>(201, "SuperAdmin user successfully register", savedAdmin);

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(){
        List<UserResponse> getAllUsers = adminService.getAllUsers();

        ApiResponse<List<UserResponse>> res = new ApiResponse<>(200, "User fetched successfully", getAllUsers);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @GetMapping("/workspaces")
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getAllWorkspaces(){
        List<WorkspaceResponse> getAllWorkspaces = adminService.getAllWorkspace();

        ApiResponse<List<WorkspaceResponse>> res = new ApiResponse<>(200, "Worksapces fetched successfully", getAllWorkspaces);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PatchMapping("/user/{userId}/block")
    public ResponseEntity<ApiResponse<Void>> getAllWorkspaces(@PathVariable("userId") Long userId){
        adminService.blockUser(userId);

        ApiResponse<Void> res = new ApiResponse<>(200, "User blocked successfully", null);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}
