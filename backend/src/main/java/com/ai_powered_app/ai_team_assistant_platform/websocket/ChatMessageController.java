package com.ai_powered_app.ai_team_assistant_platform.websocket;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.SendMessageRequest;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ChatMessageService;

import org.springframework.security.core.Authentication;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;


@Controller
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @MessageMapping("/projects/{projectId}/send")
    public void sendProjectMessage(
            @DestinationVariable Long projectId,
            SendMessageRequest request,
            Authentication authentication
    ) {
        System.out.println("Project controller");
        chatMessageService.sendProjectMessage(
                projectId,
                request,
                authentication
        );

    }
    @MessageMapping("/tickets/{ticketId}/send")
    public void sendTicketMessage(
            @DestinationVariable Long ticketId,
            SendMessageRequest request,
            Authentication authentication
    ) {

        chatMessageService.sendTicketMessage(
                ticketId,
                request,
                authentication
        );

    }
}
