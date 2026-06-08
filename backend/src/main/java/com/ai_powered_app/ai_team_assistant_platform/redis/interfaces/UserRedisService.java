package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;

import java.time.Duration;

public interface UserRedisService {
    void saveRedisUser(Long id, UserResponse value, Duration duration);
    UserResponse getRedisUser(Long id);
    void deleteRedisUser(Long id);
}
