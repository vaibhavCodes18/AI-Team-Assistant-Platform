package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentRequest {

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;

    private Long projectId;

    @NotBlank(message = "Document title is required")
    @Size(max = 150, message = "Document title must not exceed 150 characters")
    private String title;

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name must not exceed 255 characters")
    private String fileName;

    @NotBlank(message = "File type is required")
    @Size(max = 50, message = "File type must not exceed 50 characters")
    private String fileType;

    @NotNull(message = "File size is required")
    @Min(value = 1, message = "File size must be greater than 0")
    private Long fileSize;

    @NotBlank(message = "Storage path is required")
    @Size(max = 500, message = "Storage path must not exceed 500 characters")
    private String storagePath;
}
