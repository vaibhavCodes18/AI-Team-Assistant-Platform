package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.ChatMessageResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.PagedResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ChatService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatHistoryController {

    private final ChatService chatService;

    public ChatHistoryController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<PagedResponse<ChatMessageResponse>> getProjectMessages(@PathVariable("projectId") Long projectId, Pageable pageable){
        PagedResponse<ChatMessageResponse> response = chatService.getProjectMessages(projectId, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<PagedResponse<ChatMessageResponse>> getTicketMessages(@PathVariable("ticketId") Long ticketId, Pageable pageable){
        PagedResponse<ChatMessageResponse> response =  chatService.getTicketMessages(ticketId, pageable);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
