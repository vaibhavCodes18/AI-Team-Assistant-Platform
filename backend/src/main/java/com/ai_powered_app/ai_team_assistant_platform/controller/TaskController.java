package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.CreateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
@RestController
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest createTaskRequest) {
        TaskResponse response = taskService.createTask(createTaskRequest);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(201, "Task created", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable("taskId") Long taskId) {
        TaskResponse response = taskService.getTaskById(taskId);
        ApiResponse<TaskResponse> apiRes = new ApiResponse<>(200, "Task fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(@PathVariable("taskId") Long taskId,
            @Valid @RequestBody UpdateTaskRequest updateTaskRequest) {
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

}
