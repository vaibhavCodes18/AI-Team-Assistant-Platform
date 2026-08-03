package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.auth_util.interfaces.AuthorizationService;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ChatMessageResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.PagedResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.exception.BadCredentialsException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.mapper.interfaces.ChatMapper;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ChatService;
import com.ai_powered_app.ai_team_assistant_platform.enums.ChatRoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {
    private final ChatRoomRepository chatRoomRepository;

    private final ChatMessageRepository chatMessageRepository;

    private final ProjectRepository projectRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    private final TicketRepository ticketRepository;

    private final ChatMapper chatMapper;

    private final AuthorizationService authorizationService;

    public ChatServiceImpl(ChatRoomRepository chatRoomRepository, ChatMessageRepository chatMessageRepository, ProjectRepository projectRepository, WorkspaceMemberRepository workspaceMemberRepository, TicketRepository ticketRepository, ChatMapper chatMapper, AuthorizationService authorizationService) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.projectRepository = projectRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.ticketRepository = ticketRepository;
        this.chatMapper = chatMapper;
        this.authorizationService = authorizationService;
    }

    @Override
    @Transactional
    public PagedResponse<ChatMessageResponse> getProjectMessages(Long projectId, Pageable pageable) {
        User currentUser = authorizationService.getAuthenticateUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with this projectId"));
        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if(!authorizationService.isUserAuthorizedMember(workspaceMember, currentUser, project)){
            throw new BadCredentialsException("You are not authorized to get project messages");
        }

        ChatRoom chatRoom = chatRoomRepository.findByProjectId(projectId)
                .orElseGet(() -> {
                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setType(ChatRoomType.PROJECT);
                    newRoom.setProject(project);
                    return chatRoomRepository.save(newRoom);
                });

        Page<ChatMessage> chatMessagePage = chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoom.getId(), pageable);

        Page<ChatMessageResponse> page = chatMessagePage.map(chatMapper::toChatMessageResponse);
        return PagedResponse.from(page);
    }

    @Override
    @Transactional
    public PagedResponse<ChatMessageResponse> getTicketMessages(Long ticketId, Pageable pageable) {
        User currentUser = authorizationService.getAuthenticateUser();

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with this ticketId"));

        Project project = projectRepository.findById(ticket.getProject().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with this projectId"));
        WorkspaceMember workspaceMember = workspaceMemberRepository
                .findByWorkspaceIdAndUserId(project.getWorkspace().getId(), currentUser.getId())
                .orElseThrow(() -> new BadCredentialsException("You are not a member of this workspace"));

        if(!authorizationService.isUserAuthorizedMember(workspaceMember, currentUser, project)){
            throw new BadCredentialsException("You are not authorized to get ticket messages");
        }

        ChatRoom chatRoom = chatRoomRepository.findByTicketId(ticketId)
                .orElseGet(() -> {
                    ChatRoom newRoom = new ChatRoom();
                    newRoom.setType(ChatRoomType.TICKET);
                    newRoom.setTicket(ticket);
                    return chatRoomRepository.save(newRoom);
                });

        Page<ChatMessage> chatMessagePage = chatMessageRepository.findByChatRoomIdOrderByCreatedAtDesc(chatRoom.getId(), pageable);

        Page<ChatMessageResponse> page = chatMessagePage.map(chatMapper::toChatMessageResponse);
        return PagedResponse.from(page);
    }
}
