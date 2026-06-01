package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public TicketResponse createTicket(TicketRequest ticketRequest) {

        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(ticketRequest.getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Workspace workspace = workspaceRepository.findById(project.getWorkspace().getId()).orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if (member.getRole() != WorkspaceRole.OWNER && member.getRole() != WorkspaceRole.ADMIN && member.getRole() != WorkspaceRole.MEMBER) {
            throw new BadCredentialsException("You do not have permission to create this ticket");
        }

        User assignee = userRepository.findByEmail(ticketRequest.getAssigneeEmail()).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));

        Ticket ticket = new Ticket();
        ticket.setProject(project);
        ticket.setTitle(ticketRequest.getTitle());
        ticket.setDescription(ticketRequest.getDescription());
        ticket.setStatus(ticketRequest.getStatus());
        ticket.setPriority(ticketRequest.getPriority());
        ticket.setAssignee(assignee);
        ticket.setCreatedBy(currentUser);
        ticket.setDueDate(ticketRequest.getDueDate());

        Ticket savedTicket = ticketRepository.save(ticket);

        return mapToTicketResponse(savedTicket);
    }

    @Override
    public TicketResponse getTicketById(Long ticketId) {
        User currentUser = getAuthenticateUser();

        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        Project project = projectRepository.findById(ticket.getProject().getId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Workspace workspace = workspaceRepository.findById(project.getWorkspace().getId()).orElseThrow(() -> new ResourceNotFoundException("Workspace not found with this workspaceId."));

        if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), currentUser.getId())) {
            throw new BadCredentialsException("You are not a member of this workspace");
        }

        return mapToTicketResponse(ticket);
    }

    private TicketResponse mapToTicketResponse(Ticket ticket){
        return TicketResponse.builder()
                .id(ticket.getId())
                .projectId(ticket.getProject().getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .assigneeId(ticket.getAssignee().getId())
                .createdById(ticket.getCreatedBy().getId())
                .dueDate(ticket.getDueDate())
                .aiSummary(ticket.getAiSummary())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    private User getAuthenticateUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
