package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;

import java.time.Duration;

public interface AiDocumentationRedisService {
    void saveAiGeneratedResponse(String key, GenerateDocsResponse value, Duration duration);
    GenerateDocsResponse getAiGeneratedResponse(String key);
}
