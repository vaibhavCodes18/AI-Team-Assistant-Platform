package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;


import java.time.Duration;

public interface SummaryRedisService {
    void saveSummaryRedis(Long id, String value, Duration duration);
    String getSummaryRedis(Long id);
    void deleteSummaryRedis(Long id);
}
