package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDashboardResponse {

    private Long totalTasks;

    private Long todoTasks;

    private Long inProgressTasks;

    private Long reviewTasks;

    private Long completedTasks;

    private Long overdueTasks;

    private List<TaskResponse> myTasks;

    private List<TaskResponse> upcoming;

    private List<TaskResponse> overdue;

    private List<TaskResponse> completed;

    private List<TaskResponse> inProgress;

}
