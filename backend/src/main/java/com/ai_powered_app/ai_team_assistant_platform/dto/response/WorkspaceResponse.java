package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String logoUrl;
    private Boolean isActive;
    private UserResponse owner;
    private Set<UserResponse> workspaceMembers;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
