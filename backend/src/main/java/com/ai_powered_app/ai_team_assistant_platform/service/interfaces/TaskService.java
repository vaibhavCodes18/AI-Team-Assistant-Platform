package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.AssignTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.CreateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TaskSearchRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskStatusRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ActivityLogResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskDashboardResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;

import java.util.List;

public interface TaskService {
    TaskResponse createTask(CreateTaskRequest createTaskRequest);
    TaskResponse getTaskById(Long taskId);
    TaskResponse updateTask(Long taskId, UpdateTaskRequest request);
    void deleteTask(Long taskId);
    TaskResponse assignTask(Long taskId, AssignTaskRequest request);
    TaskResponse updateStatus(Long taskId, UpdateTaskStatusRequest request);
    TaskResponse markComplete(Long taskId);
    List<TaskResponse> getProjectTasks(Long projectId);
    List<TaskResponse> getMyTasks();
    List<TaskResponse> getOverdueTasks();
    List<TaskResponse> searchTasks(TaskSearchRequest request);
    TaskDashboardResponse getDashboardTasks();
    List<ActivityLogResponse> getTaskActivities(Long taskId);
}
