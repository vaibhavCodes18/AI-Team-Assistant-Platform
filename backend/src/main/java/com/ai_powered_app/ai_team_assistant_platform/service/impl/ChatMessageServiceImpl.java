package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.auth_util.interfaces.AuthorizationService;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.SendMessageRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ChatMessageResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.mapper.interfaces.ChatMapper;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.security.CustomUserDetails;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ChatMessageService;
import jakarta.transaction.Transactional;

import org.springframework.security.core.Authentication;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ChatMessageServiceImpl implements ChatMessageService {

    private final ChatRoomRepository chatRoomRepository;

    private final ChatMessageRepository chatMessageRepository;

    private final ProjectRepository projectRepository;

    private final TicketRepository ticketRepository;

    private final ChatMapper chatMapper;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;
    
    private final AuthorizationService authorizationService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ChatMessageServiceImpl(ChatRoomRepository chatRoomRepository, ChatMessageRepository chatMessageRepository, ProjectRepository projectRepository, TicketRepository ticketRepository, ChatMapper chatMapper, SimpMessagingTemplate messagingTemplate, AuthorizationService authorizationService, WorkspaceMemberRepository workspaceMemberRepository, UserRepository userRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.projectRepository = projectRepository;
        this.ticketRepository = ticketRepository;
        this.chatMapper = chatMapper;
        this.messagingTemplate = messagingTemplate;
        this.authorizationService = authorizationService;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void sendProjectMessage(Long projectId, SendMessageRequest request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new BadCredentialsException("User is not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        Long userId = userDetails.getId();

        User currentUser = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with this userId"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with this projectId"));
        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if(!authorizationService.isUserAuthorizedMember(workspaceMember, currentUser, project)){
            throw new BadCredentialsException("You are not authorized to get project messages");
        }
        ChatRoom chatRoom = chatRoomRepository.findByProjectId(projectId).orElseThrow(() -> new ResourceNotFoundException("Chat room is not found with this projectId"));
        ChatMessage message = new ChatMessage();

        message.setChatRoom(chatRoom);

        message.setSender(currentUser);

        message.setMessage(request.getMessage());

        message.setEdited(false);

        message.setDeleted(false);
        chatMessageRepository.save(message);

        ChatMessageResponse response =
                chatMapper.toChatMessageResponse(message);

        messagingTemplate.convertAndSend(
                "/topic/projects/" + projectId,
                response
        );
    }

    @Override
    public void sendTicketMessage(Long ticketId, SendMessageRequest request, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new BadCredentialsException("User is not authenticated");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User currentUser = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with this userId"));
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with this ticketId"));

        Project project = projectRepository.findById(ticket.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with this projectId"));
        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if(!authorizationService.isUserAuthorizedMember(workspaceMember, currentUser, project)){
            throw new BadCredentialsException("You are not authorized to get project messages");
        }
        ChatRoom chatRoom = chatRoomRepository.findByTicketId(ticketId).orElseThrow(() -> new ResourceNotFoundException("Chat room is not found with this projectId"));
        ChatMessage message = new ChatMessage();

        message.setChatRoom(chatRoom);

        message.setSender(currentUser);

        message.setMessage(request.getMessage());

        message.setEdited(false);

        message.setDeleted(false);
        chatMessageRepository.save(message);

        ChatMessageResponse response =
                chatMapper.toChatMessageResponse(message);

        messagingTemplate.convertAndSend(
                "/topic/tickets/" + ticketId,
                response
        );
    }
}
