package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.AssignTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.CreateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TaskSearchRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskStatusRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ActivityLogResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskDashboardResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(@Valid @RequestBody CreateTaskRequest createTaskRequest) {
        TaskResponse response = taskService.createTask(createTaskRequest);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(201, "Task created", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getMyTasks() {
        List<TaskResponse> response = taskService.getMyTasks();
        ApiResponse<List<TaskResponse>> apiRes = new ApiResponse<>(200, "My tasks fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getOverdueTasks() {
        List<TaskResponse> response = taskService.getOverdueTasks();
        ApiResponse<List<TaskResponse>> apiRes = new ApiResponse<>(200, "Overdue tasks fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> searchTasks(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "status", required = false) com.ai_powered_app.ai_team_assistant_platform.enums.TaskStatus status,
            @RequestParam(value = "priority", required = false) com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority priority,
            @RequestParam(value = "assignedTo", required = false) Long assignedTo,
            @RequestParam(value = "projectId", required = false) Long projectId) {
        TaskSearchRequest request = TaskSearchRequest.builder()
                .keyword(keyword)
                .status(status)
                .priority(priority)
                .assignedUserId(assignedTo)
                .projectId(projectId)
                .build();
        List<TaskResponse> response = taskService.searchTasks(request);
        ApiResponse<List<TaskResponse>> apiRes = new ApiResponse<>(200, "Search results fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<TaskDashboardResponse>> getDashboardTasks() {
        TaskDashboardResponse response = taskService.getDashboardTasks();
        ApiResponse<TaskDashboardResponse> apiRes = new ApiResponse<>(200, "Dashboard tasks fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(@PathVariable("taskId") Long taskId) {
        TaskResponse response = taskService.getTaskById(taskId);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(200, "Task fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(@PathVariable("taskId") Long taskId, @Valid @RequestBody UpdateTaskRequest updateTaskRequest) {
        TaskResponse response = taskService.updateTask(taskId, updateTaskRequest);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(200, "Task updated successfully", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable("taskId") Long taskId) {
        taskService.deleteTask(taskId);
        ApiResponse<Void> apiRes = new ApiResponse<>(200, "Task deleted successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PatchMapping("/{taskId}/assign")
    public ResponseEntity<ApiResponse<TaskResponse>> assignTask(@PathVariable("taskId") Long taskId, @Valid @RequestBody AssignTaskRequest assignTaskRequest) {
        TaskResponse response = taskService.assignTask(taskId, assignTaskRequest);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(200, "Task assigned successfully", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(@PathVariable("taskId") Long taskId, @Valid @RequestBody UpdateTaskStatusRequest updateTaskStatusRequest) {
        TaskResponse response = taskService.updateStatus(taskId, updateTaskStatusRequest);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(200, "Task status updated successfully", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<TaskResponse>> markComplete(@PathVariable("taskId") Long taskId) {
        TaskResponse response = taskService.markComplete(taskId);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(200, "Task marked complete successfully", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @GetMapping("/{taskId}/activities")
    public ResponseEntity<ApiResponse<List<ActivityLogResponse>>> getTaskActivities(@PathVariable("taskId") Long taskId) {
        List<ActivityLogResponse> response = taskService.getTaskActivities(taskId);
        ApiResponse<List<ActivityLogResponse>> apiRes = new ApiResponse<>(200, "Task activities fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }
}
