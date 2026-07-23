package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.InviteUserInProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.ProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectMemberRole;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectMemberResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ProjectService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TaskService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    private final TaskService taskService;
    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest projectRequest){
        ProjectResponse projectResponse = projectService.createProject(projectRequest);

        ApiResponse<ProjectResponse> apiRes = new ApiResponse<>(201, "project created", projectResponse);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable("id") Long id){
        ProjectResponse projectResponse = projectService.getProjectById(id);

        ApiResponse<ProjectResponse> apiRes = new ApiResponse<>(200, "project fetched", projectResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/workspaces/{workspaceId}")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getWorkspaceProjects(@PathVariable("workspaceId") Long workspaceId){
        List<ProjectResponse> projectResponse = projectService.getWorkspaceProjects(workspaceId);

        ApiResponse<List<ProjectResponse>> apiRes = new ApiResponse<>(200, "All projects fetched", projectResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getProjectMembers(@PathVariable("projectId") Long projectId){
        List<ProjectMemberResponse> projectResponse = projectService.getProjectMembers(projectId);

        ApiResponse<List<ProjectMemberResponse>> apiRes = new ApiResponse<>(200, "Project members fetched successfully", projectResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PostMapping("/{projectId}/invite")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> inviteUserToProject(@PathVariable("projectId") Long projectId, @Valid @RequestBody InviteUserInProjectRequest inviteUserInProjectResponse ){
        List<ProjectMemberResponse> projectResponse = projectService.inviteUserToProject(projectId, inviteUserInProjectResponse.getEmails());

        ApiResponse<List<ProjectMemberResponse>> apiRes = new ApiResponse<>(200, "Project members invited successfully", projectResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @DeleteMapping("/{projectId}/member/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMemberFromProject(@PathVariable("projectId") Long projectId, @PathVariable("userId") Long userId){
        projectService.removeMemberFromProject(projectId, userId);

        ApiResponse<Void> apiRes = new ApiResponse<>(200, "User removed from project successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PatchMapping("/{projectId}/member/{userId}/role")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateProjectMemberRole(@PathVariable("projectId") Long projectId, @PathVariable("userId") Long userId, @Valid @RequestBody UpdateProjectMemberRole updateProjectMemberRole){
        ProjectMemberResponse projectResponse = projectService.changeProjectMemberRole(projectId, userId, updateProjectMemberRole);

        ApiResponse<ProjectMemberResponse> apiRes = new ApiResponse<>(200, "Member role updated successfully", projectResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updatedProject(@PathVariable("projectId") Long projectId, @Valid @RequestBody UpdateProjectRequest updateProjectRequest){
        ProjectResponse projectResponse = projectService.updateProject(projectId, updateProjectRequest);

        ApiResponse<ProjectResponse> apiRes = new ApiResponse<>(200, "Project update successfully", projectResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable("projectId") Long projectId){
        projectService.deleteProject(projectId);

        ApiResponse<Void> apiRes = new ApiResponse<>(200, "Project delete successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getRecentProjectTasks(
            @PathVariable("projectId") Long projectId) {
        List<TaskResponse> tasks = taskService.getProjectTasks(projectId);
        ApiResponse<List<TaskResponse>> apiRes = new ApiResponse<>(200, "Project tasks fetched successfully", tasks);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }
    @GetMapping("/{projectId}/tickets")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getRecentProjectTickets(
            @PathVariable("projectId") Long projectId) {
        List<TicketResponse> tasks = ticketService.getProjectTickets(projectId);
        ApiResponse<List<TicketResponse>> apiRes = new ApiResponse<>(200, "Project tasks fetched successfully", tasks);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

}
