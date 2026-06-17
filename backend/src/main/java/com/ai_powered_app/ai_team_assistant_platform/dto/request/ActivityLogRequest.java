package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import com.ai_powered_app.ai_team_assistant_platform.enums.ActivityAction;
import com.ai_powered_app.ai_team_assistant_platform.enums.EntityType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogRequest {

    private Workspace workspace;

    private User user;

    private ActivityAction action;

    private EntityType entityType;

    private Long entityId;

    private String metadata;

}
