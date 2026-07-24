package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.CreateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;


public interface TaskService {
    TaskResponse createTask(CreateTaskRequest createTaskRequest);
    TaskResponse getTaskById(Long taskId);
    TaskResponse updateTask(Long taskId, UpdateTaskRequest request);
    void deleteTask(Long taskId);
}
