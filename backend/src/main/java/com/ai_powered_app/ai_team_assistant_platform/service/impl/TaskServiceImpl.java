package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ActivityLogRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.AssignTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.CreateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.NotificationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskStatusRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TaskSearchRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ActivityLogResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskDashboardResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.enums.*;
import com.ai_powered_app.ai_team_assistant_platform.exception.AccessDeniedException;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.TaskRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ActivityLogService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.NotificationService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TaskService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ActivityLogService activityLogService;
    private final NotificationService notificationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRedisService taskRedisService;
    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskRequest createTaskRequest) {

        User currentUser = getAuthenticatedUser();

        Project project = projectRepository.findById(createTaskRequest.getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Workspace workspace = project.getWorkspace();
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId()).orElseThrow(() -> new ResourceNotFoundException("Members not found"));

        if (member.getRole() != WorkspaceRole.ADMIN && member.getRole() != WorkspaceRole.OWNER) {
            throw new AccessDeniedException("Only OWNER or ADMIN can create task");
        }
        User assignedUser = null;

        if (createTaskRequest.getAssignedToUserId() != null) {

            assignedUser = userRepository.findById(
                            createTaskRequest.getAssignedToUserId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Assigned user not found."));

            if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                    workspace.getId(),
                    assignedUser.getId())) {

                throw new BadCredentialsException(
                        "Assigned user is not a member of this workspace."
                );
            }
        }

        Task task = Task.builder()
                .title(createTaskRequest.getTitle())
                .description(createTaskRequest.getDescription())
                .priority(createTaskRequest.getPriority())
                .status(TaskStatus.TODO)
                .workspace(workspace)
                .project(project)
                .assignedTo(assignedUser)
                .createdBy(currentUser)
                .startDate(createTaskRequest.getStartDate())
                .dueDate(createTaskRequest.getDueDate())
                .estimatedHours(createTaskRequest.getEstimatedHours())
                .archived(false)
                .build();
        Task savedTask = taskRepository.save(task);

        ActivityLogRequest request = ActivityLogRequest.builder()
                .workspace(workspace)
                .user(currentUser)
                .action(ActivityAction.TASK_CREATED)
                .entityType(EntityType.TASK)
                .entityId(savedTask.getId())
                .metadata("Task '" + savedTask.getTitle() + "' created.")
                .build();

        activityLogService.logActivity(request);

        if (assignedUser != null) {

            NotificationRequest notificationRequest = NotificationRequest.builder()
                    .recipient(assignedUser)
                    .title("Task Assigned")
                    .message("You have been assigned task: " + task.getTitle())
                    .type(NotificationType.TASK_ASSIGNED)
                    .build();

            notificationService.sendNotification(notificationRequest);
        }

        return mapToTaskResponse(savedTask);
    }

    @Override
    public TaskResponse getTaskById(Long taskId) {
        User currentUser = getAuthenticatedUser();

        TaskResponse cachedResponse = taskRedisService.getTaskRedis(taskId);
        if (cachedResponse != null) {
            WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                    cachedResponse.getWorkspaceId(), currentUser.getId())
                    .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

            if (member.getRole() != WorkspaceRole.OWNER &&
                member.getRole() != WorkspaceRole.ADMIN &&
                member.getRole() != WorkspaceRole.MEMBER) {
                throw new AccessDeniedException("Access denied to view this task");
            }
            return cachedResponse;
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER &&
            member.getRole() != WorkspaceRole.ADMIN &&
            member.getRole() != WorkspaceRole.MEMBER) {
            throw new AccessDeniedException("Access denied to view this task");
        }

        TaskResponse response = mapToTaskResponse(task);
        taskRedisService.saveTaskRedis(taskId, response, Duration.ofMinutes(10L));
        return response;
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {
        User currentUser = getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only OWNER or ADMIN can update task");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStartDate(request.getStartDate());
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());

        Task updatedTask = taskRepository.save(task);

        ActivityLogRequest logRequest = ActivityLogRequest.builder()
                .workspace(task.getWorkspace())
                .user(currentUser)
                .action(ActivityAction.TASK_UPDATED)
                .entityType(EntityType.TASK)
                .entityId(updatedTask.getId())
                .metadata("Task '" + updatedTask.getTitle() + "' updated.")
                .build();
        activityLogService.logActivity(logRequest);

        taskRedisService.deleteTaskRedis(taskId);

        return mapToTaskResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId) {
        User currentUser = getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only OWNER or ADMIN can delete task");
        }

        ActivityLogRequest logRequest = ActivityLogRequest.builder()
                .workspace(task.getWorkspace())
                .user(currentUser)
                .action(ActivityAction.TASK_DELETED)
                .entityType(EntityType.TASK)
                .entityId(task.getId())
                .metadata("Task '" + task.getTitle() + "' deleted.")
                .build();
        activityLogService.logActivity(logRequest);

        taskRepository.delete(task);
        taskRedisService.deleteTaskRedis(taskId);
    }

    @Override
    @Transactional
    public TaskResponse assignTask(Long taskId, AssignTaskRequest request) {
        User currentUser = getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN) {
            throw new AccessDeniedException("Only OWNER or ADMIN can assign task");
        }

        User assignedUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(task.getWorkspace().getId(), assignedUser.getId())) {
            throw new BadCredentialsException("Assigned user is not a member of this workspace.");
        }

        task.setAssignedTo(assignedUser);
        Task updatedTask = taskRepository.save(task);

        ActivityLogRequest logRequest = ActivityLogRequest.builder()
                .workspace(task.getWorkspace())
                .user(currentUser)
                .action(ActivityAction.TASK_ASSIGNED)
                .entityType(EntityType.TASK)
                .entityId(updatedTask.getId())
                .metadata("Task '" + updatedTask.getTitle() + "' assigned to " + assignedUser.getName())
                .build();
        activityLogService.logActivity(logRequest);

        NotificationRequest notificationRequest = NotificationRequest.builder()
                .recipient(assignedUser)
                .title("Task Assigned")
                .message("You have been assigned a task: " + task.getTitle())
                .type(NotificationType.TASK_ASSIGNED)
                .build();
        notificationService.sendNotification(notificationRequest);

        taskRedisService.deleteTaskRedis(taskId);

        return mapToTaskResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateStatus(Long taskId, UpdateTaskStatusRequest request) {
        User currentUser = getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId());
        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN && !isAssigned) {
            throw new AccessDeniedException("Only OWNER, ADMIN or the assigned MEMBER can update task status");
        }

        task.setStatus(request.getStatus());
        Task updatedTask = taskRepository.save(task);

        ActivityLogRequest logRequest = ActivityLogRequest.builder()
                .workspace(task.getWorkspace())
                .user(currentUser)
                .action(ActivityAction.TASK_UPDATED)
                .entityType(EntityType.TASK)
                .entityId(updatedTask.getId())
                .metadata("Task moved to " + request.getStatus())
                .build();
        activityLogService.logActivity(logRequest);

        taskRedisService.deleteTaskRedis(taskId);

        return mapToTaskResponse(updatedTask);
    }

    @Override
    @Transactional
    public TaskResponse markComplete(Long taskId) {
        User currentUser = getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                task.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId());
        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN && !isAssigned) {
            throw new AccessDeniedException("Only OWNER, ADMIN or the assigned MEMBER can complete task");
        }

        task.setStatus(TaskStatus.DONE);
        Task updatedTask = taskRepository.save(task);

        ActivityLogRequest logRequest = ActivityLogRequest.builder()
                .workspace(task.getWorkspace())
                .user(currentUser)
                .action(ActivityAction.TASK_COMPLETED)
                .entityType(EntityType.TASK)
                .entityId(updatedTask.getId())
                .metadata("Task marked complete.")
                .build();
        activityLogService.logActivity(logRequest);

        taskRedisService.deleteTaskRedis(taskId);

        return mapToTaskResponse(updatedTask);
    }

    @Override
    public List<TaskResponse> getProjectTasks(Long projectId) {
        User currentUser = getAuthenticatedUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        Sort sortObj;
        if (sort != null && sort.contains(",")) {
            String[] parts = sort.split(",");
            sortObj = Sort.by(parts[0]);
            if (parts.length > 1 && parts[1].equalsIgnoreCase("desc")) {
                sortObj = sortObj.descending();
            } else {
                sortObj = sortObj.ascending();
            }
        } else if (sort != null && !sort.trim().isEmpty()) {
            sortObj = Sort.by(sort);
        } else {
            sortObj = Sort.by("id").ascending();
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Task> tasks = taskRepository.findByProjectId(projectId, pageable);

        return tasks.map(this::mapToTaskResponse);
    }

    @Override
    public List<TaskResponse> getMyTasks() {
        User currentUser = getAuthenticatedUser();
        List<Task> tasks = taskRepository.findByAssignedToId(currentUser.getId());
        return tasks.stream().map(this::mapToTaskResponse).toList();
    }

    @Override
    public List<TaskResponse> getOverdueTasks() {
        User currentUser = getAuthenticatedUser();
        List<Task> overdueTasks = taskRepository.findOverdueTasksForOwnerOrAdmin(currentUser.getId(), LocalDate.now());
        return overdueTasks.stream().map(this::mapToTaskResponse).toList();
    }

    @Override
    public List<TaskResponse> searchTasks(TaskSearchRequest request) {
        User currentUser = getAuthenticatedUser();
        List<Task> tasks = taskRepository.searchTasksForUser(
                currentUser.getId(),
                request.getKeyword(),
                request.getStatus(),
                request.getPriority(),
                request.getAssignedUserId(),
                request.getProjectId()
        );
        return tasks.stream().map(this::mapToTaskResponse).toList();
    }

    @Override
    public TaskDashboardResponse getDashboardTasks() {
        User currentUser = getAuthenticatedUser();
        List<Task> myTasks = taskRepository.findByAssignedToId(currentUser.getId());

        List<Task> completedList = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).toList();
        List<Task> inProgressList = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).toList();
        List<Task> overdueList = myTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now())).toList();
        List<Task> upcomingList = myTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE && (t.getDueDate() == null || !t.getDueDate().isBefore(LocalDate.now()))).toList();
        List<Task> activeList = myTasks.stream().filter(t -> t.getStatus() != TaskStatus.DONE).toList();

        long totalCount = myTasks.size();
        long todoCount = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgressCount = inProgressList.size();
        long reviewCount = myTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long completedCount = completedList.size();
        long overdueCount = overdueList.size();

        return TaskDashboardResponse.builder()
                .totalTasks(totalCount)
                .todoTasks(todoCount)
                .inProgressTasks(inProgressCount)
                .reviewTasks(reviewCount)
                .completedTasks(completedCount)
                .overdueTasks(overdueCount)
                .myTasks(activeList.stream().map(this::mapToTaskResponse).toList())
                .upcoming(upcomingList.stream().map(this::mapToTaskResponse).toList())
                .overdue(overdueList.stream().map(this::mapToTaskResponse).toList())
                .completed(completedList.stream().map(this::mapToTaskResponse).toList())
                .inProgress(inProgressList.stream().map(this::mapToTaskResponse).toList())
                .build();
    }

    @Override
    public List<ActivityLogResponse> getTaskActivities(Long taskId) {
        User currentUser = getAuthenticatedUser();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(task.getWorkspace().getId(), currentUser.getId())) {
            throw new AccessDeniedException("You are not a member of this workspace");
        }

        List<ActivityLog> logs = activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                EntityType.TASK.name(), taskId);

        return logs.stream().map(this::mapToActivityLogResponse).toList();
    }

    private ActivityLogResponse mapToActivityLogResponse(ActivityLog activityLog) {
        return ActivityLogResponse.builder()
                .id(activityLog.getId())
                .workspaceId(activityLog.getWorkspace().getId())
                .userId(activityLog.getUser().getId())
                .action(activityLog.getAction())
                .entityType(activityLog.getEntityType())
                .entityId(activityLog.getEntityId())
                .metadata(activityLog.getMetadata())
                .createdAt(activityLog.getCreatedAt())
                .build();
    }

    private TaskResponse mapToTaskResponse(Task task) {

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .startDate(task.getStartDate())
                .dueDate(task.getDueDate())
                .estimatedHours(task.getEstimatedHours())
                .archived(task.getArchived())

                .workspaceId(task.getWorkspace().getId())
                .workspaceName(task.getWorkspace().getName())

                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())

                .assignedUserId(
                        task.getAssignedTo() != null
                                ? task.getAssignedTo().getId()
                                : null
                )
                .assignedUserName(
                        task.getAssignedTo() != null
                                ? task.getAssignedTo().getName()
                                : null
                )

                .createdByUserId(task.getCreatedBy().getId())
                .createdByUserName(task.getCreatedBy().getName())

                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())

                .build();
    }

    private User getAuthenticatedUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
