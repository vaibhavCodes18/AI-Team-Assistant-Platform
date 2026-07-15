package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectRole;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectMemberResponse {

    private Long id;
    private Long projectId;
    private UserResponse user;
    private ProjectRole role;

}
