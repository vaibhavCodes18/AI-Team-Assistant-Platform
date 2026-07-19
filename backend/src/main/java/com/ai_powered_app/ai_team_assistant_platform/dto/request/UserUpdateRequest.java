package com.ai_powered_app.ai_team_assistant_platform.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Profile image URL must not exceed 1000 characters")
    private String profileImage;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;
}
