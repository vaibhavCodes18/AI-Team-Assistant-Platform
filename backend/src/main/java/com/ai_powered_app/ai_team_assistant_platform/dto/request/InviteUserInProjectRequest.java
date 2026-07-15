package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteUserInProjectRequest {
    List<String> emails;
}
