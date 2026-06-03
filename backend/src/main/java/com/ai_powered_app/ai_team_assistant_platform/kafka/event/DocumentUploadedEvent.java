package com.ai_powered_app.ai_team_assistant_platform.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadedEvent {
    private Long documentId;

    private Long workspaceId;

    private Long projectId;

    private Long uploadedByUserId;

    private String title;

    private LocalDateTime uploadedAt;
}
