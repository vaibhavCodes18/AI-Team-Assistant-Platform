package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.ai_powered_app.ai_team_assistant_platform.enums.ProcessingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private Long workspaceId;
    private Long projectId;
    private Long uploadedById;
    private String title;

    private String fileName;

    private String fileType;

    private Long fileSize;


    private ProcessingStatus processingStatus;
}
