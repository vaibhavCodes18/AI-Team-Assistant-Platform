package com.ai_powered_app.ai_team_assistant_platform.ai.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;

public interface AiService {
    public String generateSummary(
            String content
    );

    GenerateDocsResponse generateDocument(String sourceCode);
}
