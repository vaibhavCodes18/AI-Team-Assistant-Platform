package com.ai_powered_app.ai_team_assistant_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateDocsResponse {
    private String endpointExplanation;

    private String requestBody;

    private String responseStructure;

    private String sampleResponse;
}
