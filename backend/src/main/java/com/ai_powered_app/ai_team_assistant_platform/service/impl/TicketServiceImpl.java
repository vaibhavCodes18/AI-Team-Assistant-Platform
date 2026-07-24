package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.enums.NotificationType;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.TicketCreatedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.producer.TicketEventProducer;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TicketService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TaskRepository taskRepository;

    private final WorkspaceRepository workspaceRepository;

    private final TicketEventProducer ticketEventProducer;

    private final UserRepository userRepository;

    private final WorkspaceMemberRepository workspaceMemberRepository;

    private final ProjectRepository projectRepository;

    private final ProjectMemberRepository projectMemberRepository;

    private final ActivityLogRepository activityLogRepository;

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public TicketResponse createTicket(TicketRequest ticketRequest) {

        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(ticketRequest.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Workspace workspace = workspaceRepository.findById(project.getWorkspace().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        ProjectMember projectMember = projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this project"));

        if (!isAuthenticated(member, currentUser, project, projectMember)) {
            throw new BadCredentialsException(
                    "You do not have permission to create this ticket, only project admin, workspace admin or workspace owner can create this ticket");
        }

        Ticket ticket = new Ticket();
        ticket.setProject(project);
        ticket.setTitle(ticketRequest.getTitle());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setStatus(ticketRequest.getStatus());
        ticket.setPriority(ticketRequest.getPriority());
        ticket.setType(ticketRequest.getType());
        ticket.setReporter(currentUser);
        ticket.setDueDate(ticketRequest.getDueDate());

        Ticket savedTicket = ticketRepository.save(ticket);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(project.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("TICKET_CREATED");
        activityLog.setEntityType("TICKET");
        activityLog.setEntityId(savedTicket.getId());
        activityLog.setMetadata(currentUser.getName() + " created ticket '" + savedTicket.getTitle() + "'");
        activityLogRepository.save(activityLog);

        TicketCreatedEvent event = TicketCreatedEvent.builder()
                .ticketId(savedTicket.getId())
                .title(savedTicket.getTitle())
                .projectId(project.getId())
                .workspaceId(
                        project.getWorkspace().getId())
                .createdByUserId(
                        currentUser.getId())
                .dueDate(
                        savedTicket.getDueDate())
                .build();
        ticketEventProducer
                .publishTicketCreatedEvent(event);

        return mapToTicketResponse(savedTicket);
    }

    @Override
    public TicketResponse getTicketById(Long ticketId) {
        User currentUser = getAuthenticateUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Project project = projectRepository.findById(ticket.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (!isAuthenticatedMember(member, currentUser, project)) {
            throw new BadCredentialsException("You do not have permission to get this ticket");
        }

        return mapToTicketResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse updateTicket(Long ticketId, TicketUpdateRequest ticketUpdateRequest) {

        User currentUser = getAuthenticateUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Project project = projectRepository.findById(ticket.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Workspace workspace = workspaceRepository.findById(project.getWorkspace().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        ProjectMember projectMembers = projectMemberRepository.findByProjectIdAndUserId(project.getId(),
                currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this project"));

        if (!isAuthenticated(member, currentUser, project, projectMembers)
                || !currentUser.equals(ticket.getReporter())) {
            throw new BadCredentialsException("You do not have permission to update this ticket");
        }

        if (ticketUpdateRequest.getTitle() != null && !ticketUpdateRequest.getTitle().isEmpty()) {
            ticket.setTitle(ticketUpdateRequest.getTitle());
        }
        if (ticketUpdateRequest.getDescription() != null && !ticketUpdateRequest.getDescription().isEmpty()) {
            ticket.setDescription(ticketUpdateRequest.getDescription());
        }
        if (ticketUpdateRequest.getStatus() != null && !ticketUpdateRequest.getStatus().name().isEmpty()) {
            ticket.setStatus(ticketUpdateRequest.getStatus());
        }
        if (ticketUpdateRequest.getPriority() != null && !ticketUpdateRequest.getPriority().name().isEmpty()) {
            ticket.setPriority(ticketUpdateRequest.getPriority());
        }
        if (ticketUpdateRequest.getType() != null && !ticketUpdateRequest.getType().name().isEmpty()) {
            ticket.setType(ticketUpdateRequest.getType());
        }
        if (ticketUpdateRequest.getDueDate() != null && !ticketUpdateRequest.getDueDate().toString().isEmpty()) {
            ticket.setDueDate(ticketUpdateRequest.getDueDate());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(project.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("TICKET_UPDATED");
        activityLog.setEntityType("TICKET");
        activityLog.setEntityId(updatedTicket.getId());
        activityLog.setMetadata(currentUser.getName() + " updated ticket '" + updatedTicket.getTitle() + "'");
        activityLogRepository.save(activityLog);

        List<ProjectMember> projectMemberss = projectMemberRepository
                .findByProjectIdOrderByUpdatedAtDesc(project.getId());
        List<Notification> notifications = new ArrayList<>();

        for (ProjectMember projectMember : projectMemberss) {

            Notification notification = new Notification();
            notification.setRecipient(projectMember.getUser());
            notification.setTitle("Ticket Updated");
            notification.setMessage(currentUser.getName() + " updated ticket: " + updatedTicket.getTitle());
            notification.setType(NotificationType.TICKET_UPDATED);
            notification.setIsRead(false);
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);

        return mapToTicketResponse(updatedTicket);
    }

    @Override
    @Transactional
    public void deleteTicket(Long ticketId) {
        User currentUser = getAuthenticateUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Project project = projectRepository.findById(ticket.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Workspace workspace = workspaceRepository.findById(project.getWorkspace().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        ProjectMember projectMember = projectMemberRepository
                .findByProjectIdAndUserId(project.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this project"));

        if (!isAuthenticated(workspaceMember, currentUser, project, projectMember)) {
            throw new BadCredentialsException("You do not have permission to delete this ticket");
        }

        ticket.setProject(null);
        ticketRepository.save(ticket);
        ticketRepository.deleteById(ticketId);

        ActivityLog activityLog = new ActivityLog();
        activityLog.setWorkspace(project.getWorkspace());
        activityLog.setUser(currentUser);
        activityLog.setAction("TICKET_DELETED");
        activityLog.setEntityType("TICKET");
        activityLog.setEntityId(ticket.getId());
        activityLog.setMetadata(currentUser.getName() + " deleted ticket '" + ticket.getTitle() + "'");
        activityLogRepository.save(activityLog);

        List<ProjectMember> projectMembersToNotify = projectMemberRepository
                .findByProjectIdOrderByUpdatedAtDesc(project.getId());
        List<Notification> notifications = new ArrayList<>();

        for (ProjectMember member : projectMembersToNotify) {
            Notification notification = new Notification();
            notification.setRecipient(member.getUser());
            notification.setTitle("Ticket Deleted");
            notification.setMessage(currentUser.getName() + " deleted ticket: " + ticket.getTitle());
            notification.setType(NotificationType.TASK_DELETED);
            notification.setIsRead(false);
            notifications.add(notification);
        }
        notificationRepository.saveAll(notifications);
    }

    @Override
    public List<TaskResponse> getTicketTasks(Long ticketId) {

        User currentUser = getAuthenticateUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with this ticketId"));

        Project project = projectRepository.findById(ticket.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with this projectId"));
        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));
        if (!isAuthenticatedMember(workspaceMember, currentUser, project)) {
            throw new BadCredentialsException("You are not authorized to get project tasks");
        }
        List<Task> tasks = taskRepository.findByTicketIdOrderByUpdatedAtDesc(ticketId);
        return tasks.stream().map(this::getTaskResponse).toList();

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

    private boolean isAuthenticated(WorkspaceMember workspaceMember, User currentUser, Project project,
            ProjectMember projectMember) {
        if (workspaceMember.getRole() == WorkspaceRole.OWNER || workspaceMember.getRole() == WorkspaceRole.ADMIN) {
            return true;
        } else {
            if (projectMember.getRole() == ProjectRole.PROJECT_ADMIN) {
                return true;
            }
        }
        return false;
    }

    private boolean isAuthenticatedMember(WorkspaceMember workspaceMember, User currentUser, Project project) {
        if (workspaceMember.getRole() == WorkspaceRole.OWNER || workspaceMember.getRole() == WorkspaceRole.ADMIN) {
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

    private TicketResponse mapToTicketResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .projectId(ticket.getProject().getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .reporterId(ticket.getReporter().getId())
                .dueDate(ticket.getDueDate())
                .build();
    }

    private User getAuthenticateUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
