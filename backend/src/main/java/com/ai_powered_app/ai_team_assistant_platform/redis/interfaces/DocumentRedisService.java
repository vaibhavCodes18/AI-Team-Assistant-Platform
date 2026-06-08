package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentViewResponse;

import java.time.Duration;

public interface DocumentRedisService {
    void saveDocumentRedis(Long id, DocumentViewResponse value, Duration duration);
    DocumentViewResponse getDocumentRedis(Long id);
    void deleteDocumentRedis(Long id);
}
