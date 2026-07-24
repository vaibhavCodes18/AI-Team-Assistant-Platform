package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ActivityLogRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.CreateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateTaskRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.enums.*;
import com.ai_powered_app.ai_team_assistant_platform.exception.AccessDeniedException;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.TaskRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ActivityLogService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TaskService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class TaskServiceImpl implements TaskService {

        private final UserRepository userRepository;
        private final TaskRepository taskRepository;
        private final ActivityLogService activityLogService;
        private final WorkspaceMemberRepository workspaceMemberRepository;
        private final ProjectRepository projectRepository;
        private final ProjectMemberRepository projectMemberRepository;
        private final TicketRepository ticketRepository;
        private final TaskRedisService taskRedisService;

        public TaskServiceImpl(UserRepository userRepository,
                               TaskRepository taskRepository,
                               ActivityLogService activityLogService,
                               WorkspaceMemberRepository workspaceMemberRepository,
                               ProjectRepository projectRepository,
                               ProjectMemberRepository projectMemberRepository,
                               TicketRepository ticketRepository,
                               TaskRedisService taskRedisService) {
                this.userRepository = userRepository;
                this.taskRepository = taskRepository;
                this.activityLogService = activityLogService;
                this.workspaceMemberRepository = workspaceMemberRepository;
                this.projectRepository = projectRepository;
                this.projectMemberRepository = projectMemberRepository;
                this.ticketRepository = ticketRepository;
                this.taskRedisService = taskRedisService;
        }

        @Override
        @Transactional
        public TaskResponse createTask(CreateTaskRequest taskRequest) {
                User currentUser = getAuthenticatedUser();

                Project project = projectRepository.findById(taskRequest.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                WorkspaceMember workspaceMember = workspaceMemberRepository
                                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                                .orElseThrow(() -> new BadCredentialsException(
                                                "You are not a member of this workspace"));

                ProjectMember projectMember = projectMemberRepository
                                .findByProjectIdAndUserId(taskRequest.getProjectId(), currentUser.getId()).orElse(null);

                if (!isAuthenticated(workspaceMember, currentUser, project, projectMember)) {
                        throw new BadCredentialsException("You are not authorized to create task in this project");
                }

                Task task = new Task();
                task.setTitle(taskRequest.getTitle());
                task.setDescription(taskRequest.getDescription());
                task.setStatus(TaskStatus.TODO);
                task.setPriority(taskRequest.getPriority());
                task.setDueDate(taskRequest.getDueDate());
                task.setCreatedBy(currentUser);

                if (taskRequest.getTicketId() != null && !(taskRequest.getTicketId() > 0L)) {
                        Ticket ticket = ticketRepository.findById(taskRequest.getTicketId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
                        task.setTicket(ticket);
                } else {
                        // Task belong to project
                        task.setTicket(null);
                        task.setProject(project);
                }

                if (taskRequest.getAssigneeId() != null && !(taskRequest.getAssigneeId() > 0L)) {
                        User assignee = userRepository.findById(taskRequest.getAssigneeId())
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        task.setAssignee(assignee);
                } else {
                        task.setAssignee(null);
                }

                taskRepository.save(task);
                return getTaskResponse(task);
        }

        @Override
        public TaskResponse getTaskById(Long taskId) {
                User currentUser = getAuthenticatedUser();

                Task task = taskRepository.findById(taskId)
                                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

                Project project = task.getProject();

                WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                                project.getWorkspace().getId(), currentUser.getId())
                                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

                if (!isAuthenticatedMember(member, currentUser, project)) {
                        throw new AccessDeniedException("You are not authorized to access this task");
                }

                TaskResponse cachedResponse = taskRedisService.getTaskRedis(taskId);
                if (cachedResponse != null) {
                        return cachedResponse;
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

                Project project = task.getProject();

                WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                                project.getWorkspace().getId(), currentUser.getId())
                                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserId(project.getId(),
                                currentUser.getId()).orElse(null);

                if (!isAuthenticated(member, currentUser, project, projectMember)) {
                        throw new AccessDeniedException("You are not authorized to access this task");
                }

                if (request.getTitle() != null && !request.getTitle().isEmpty()) {
                        task.setTitle(request.getTitle());
                }

                if (request.getDescription() != null && !request.getDescription().isEmpty()) {
                        task.setDescription(request.getDescription());
                }

                if (request.getPriority() != null) {
                        task.setPriority(request.getPriority());
                }

                if (request.getStatus() != null) {
                        task.setStatus(request.getStatus());
                }

                if (request.getDueDate() != null) {
                        task.setDueDate(request.getDueDate());
                }

                if (request.getAssigneeId() != null && (request.getAssigneeId() > 0L)) {
                        User assignee = userRepository.findById(request.getAssigneeId())
                                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        task.setAssignee(assignee);
                } else {
                        task.setAssignee(task.getAssignee());
                }

                Task updatedTask = taskRepository.save(task);

                ActivityLogRequest logRequest = ActivityLogRequest.builder()
                                .workspace(project.getWorkspace())
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

                Project project = task.getProject();

                WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(
                                project.getWorkspace().getId(), currentUser.getId())
                                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

                ProjectMember projectMember = projectMemberRepository.findByProjectIdAndUserId(project.getId(),
                                currentUser.getId()).orElse(null);

                if (!isAuthenticated(member, currentUser, project, projectMember)) {
                        throw new AccessDeniedException("You are not authorized to access this task");
                }

                ActivityLogRequest logRequest = ActivityLogRequest.builder()
                                .workspace(project.getWorkspace())
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

        private TaskResponse mapToTaskResponse(Task task) {
                if (task == null)
                        return null;
                return TaskResponse.builder()
                                .id(task.getId())
                                .title(task.getTitle())
                                .description(task.getDescription())
                                .status(task.getStatus())
                                .priority(task.getPriority())
                                .dueDate(task.getDueDate())
                                .projectId(task.getProject().getId())
                                .ticketId(task.getTicket() != null ? task.getTicket().getId() : null)
                                .assignedUserId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                                .createdByUserId(task.getCreatedBy().getId())
                                .build();
        }

        private boolean isAuthenticated(WorkspaceMember workspaceMember, User currentUser, Project project,
                        ProjectMember projectMember) {
                if (workspaceMember.getRole() == WorkspaceRole.OWNER
                                || workspaceMember.getRole() == WorkspaceRole.ADMIN) {
                        return true;
                } else {
                        if (projectMember.getRole() == ProjectRole.PROJECT_ADMIN) {
                                return true;
                        }
                }
                return false;
        }

        private boolean isAuthenticatedMember(WorkspaceMember workspaceMember, User currentUser, Project project) {
                if (workspaceMember.getRole() == WorkspaceRole.OWNER ||
                                workspaceMember.getRole() == WorkspaceRole.ADMIN) {
                        return true;
                } else {
                        boolean isProjectMember = projectMemberRepository.existsByProjectIdAndUserId(project.getId(),
                                        currentUser.getId());
                        if (isProjectMember) {
                                return true;
                        }
                }
                return false;
        }

        private TaskResponse getTaskResponse(Task task) {
                if (task == null)
                        return null;
                return TaskResponse.builder()
                                .id(task.getId())
                                .title(task.getTitle())
                                .description(task.getDescription())
                                .status(task.getStatus())
                                .priority(task.getPriority())
                                .dueDate(task.getDueDate())
                                .projectId(task.getProject().getId())
                                .ticketId(task.getTicket() != null ? task.getTicket().getId() : null)
                                .assignedUserId(task.getAssignee() != null ? task.getAssignee().getId() : null)
                                .createdByUserId(task.getCreatedBy().getId())
                                .build();
        }

        private User getAuthenticatedUser() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
        }
}
