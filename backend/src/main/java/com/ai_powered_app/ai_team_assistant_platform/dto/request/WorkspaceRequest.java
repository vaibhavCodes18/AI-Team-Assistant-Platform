package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceRequest {

    @NotBlank(message = "Workspace name is required")
    @Size(max = 100, message = "Workspace name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Workspace slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    @Size(max = 100, message = "Workspace slug must not exceed 100 characters")
    private String slug;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Size(max = 255, message = "Logo URL must not exceed 255 characters")
    private String logoUrl;
}
