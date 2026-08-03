package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import org.springframework.security.core.Authentication;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.SendMessageRequest;

public interface ChatMessageService {
    void sendProjectMessage(Long projectId, SendMessageRequest request, Authentication authentication);
    void sendTicketMessage(Long ticketId, SendMessageRequest request, Authentication authentication);
}
