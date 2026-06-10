package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceMemberRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRoleUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ActivityLogResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceMemberResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {

    @Autowired
    private WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(@Valid @RequestBody WorkspaceRequest workspaceRequest){
        WorkspaceResponse response = workspaceService.createWorkspace(workspaceRequest);
        ApiResponse<WorkspaceResponse> apiRes = new ApiResponse<>(201, "Workspaces created", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspace(@PathVariable("id") Long id){
        WorkspaceResponse response = workspaceService.getWorkspaceById(id);
        ApiResponse<WorkspaceResponse> apiRes = new ApiResponse<>(200, "Workspaces Fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> updateWorkspace(
            @PathVariable("id") Long id,
            @Valid @RequestBody WorkspaceUpdateRequest workspaceUpdateRequest) {
        WorkspaceResponse response = workspaceService.updateWorkspace(id, workspaceUpdateRequest);
        ApiResponse<WorkspaceResponse> apiRes = new ApiResponse<>(200, "Workspace Updated", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkspace(@PathVariable("id") Long id) {
        workspaceService.deleteWorkspace(id);
        ApiResponse<Void> apiRes = new ApiResponse<>(200, "Workspace Deleted", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> inviteMember(
            @PathVariable("id") Long id,
            @Valid @RequestBody WorkspaceMemberRequest request) {
        WorkspaceMemberResponse response = workspaceService.inviteMember(id, request);
        ApiResponse<WorkspaceMemberResponse> apiRes = new ApiResponse<>(201, "Member Invited", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable("id") Long id,
            @PathVariable("userId") Long userId) {
        workspaceService.removeMember(id, userId);
        ApiResponse<Void> apiRes = new ApiResponse<>(200, "Member Removed", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PatchMapping("/{id}/members/{userId}/role")
    public ResponseEntity<ApiResponse<WorkspaceMemberResponse>> updateMemberRole(
            @PathVariable("id") Long id,
            @PathVariable("userId") Long userId,
            @Valid @RequestBody WorkspaceRoleUpdateRequest request) {
        WorkspaceMemberResponse response = workspaceService.updateMemberRole(id, userId, request);
        ApiResponse<WorkspaceMemberResponse> apiRes = new ApiResponse<>(200, "Member Role Updated", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<WorkspaceMemberResponse>>> getWorkspaceMembers(
            @PathVariable("id") Long id) {
        List<WorkspaceMemberResponse> response = workspaceService.getWorkspaceMembers(id);
        ApiResponse<List<WorkspaceMemberResponse>> apiRes = new ApiResponse<>(200, "Members Fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/{workspaceId}/activities")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getActivityLogs(
            @PathVariable("workspaceId") Long workspaceId) {
        List<ActivityLogResponse> response = workspaceService.getWorkspaceActivityLogs(workspaceId);
        ApiResponse<List<ActivityLogResponse>> apiRes = new ApiResponse<>(200, "Activity logs Fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }
}
