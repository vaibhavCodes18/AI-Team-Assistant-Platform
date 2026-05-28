package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCommentResponse {
    private Long id;
    private Long ticketId;
    private UserResponse user;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
