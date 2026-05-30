package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
