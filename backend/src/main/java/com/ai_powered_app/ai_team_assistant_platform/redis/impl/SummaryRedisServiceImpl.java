package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.SummaryRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
@Service
public class SummaryRedisServiceImpl implements SummaryRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public SummaryRedisServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void saveSummaryRedis(Long id, String value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getSummaryKey(id), value, duration);
    }

    @Override
    public String getSummaryRedis(Long id) {
        return (String) redisTemplate.opsForValue().get(RedisUtil.getSummaryKey(id));
    }

    @Override
    public void deleteSummaryRedis(Long id) {
        redisTemplate.delete(RedisUtil.getSummaryKey(id));
    }
}
