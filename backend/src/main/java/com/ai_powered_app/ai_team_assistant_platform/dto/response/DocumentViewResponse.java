package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.ai_powered_app.ai_team_assistant_platform.enums.ProcessingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentViewResponse {
    private Long id;

    private String title;

    private String fileName;

    private String fileType;

    private Long fileSize;

    private String summary;

    private ProcessingStatus processingStatus;

    private Long projectId;

    private Long workspaceId;

    private Long uploadedById;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
