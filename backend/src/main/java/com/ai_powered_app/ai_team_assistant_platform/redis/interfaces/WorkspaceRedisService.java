package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;

import java.time.Duration;

public interface WorkspaceRedisService {
    void saveRedisWorkspace(Long id, WorkspaceResponse value, Duration duration);
    WorkspaceResponse getRedisWorkspace(Long id);
    void deleteRedisWorkspace(Long id);
}
