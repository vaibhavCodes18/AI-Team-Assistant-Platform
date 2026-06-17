package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;

import java.time.Duration;

public interface TaskRedisService {
    void saveTaskRedis(Long id, TaskResponse value, Duration duration);
    TaskResponse getTaskRedis(Long id);
    void deleteTaskRedis(Long id);
}
