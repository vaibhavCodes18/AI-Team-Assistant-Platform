package com.ai_powered_app.ai_team_assistant_platform.redis;

import com.ai_powered_app.ai_team_assistant_platform.entity.Document;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
@Service
@RequiredArgsConstructor
public class DocumentRedisServiceImpl implements DocumentRedisService{

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void saveSummaryRedis(Long id, String value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getKey(id), value, duration);
    }

    @Override
    public String getSummaryRedis(Long id) {
        return (String) redisTemplate.opsForValue().get(RedisUtil.getKey(id));
    }

    @Override
    public void deleteDocsRedis(Long id) {
        redisTemplate.delete(RedisUtil.getKey(id));
    }
}
