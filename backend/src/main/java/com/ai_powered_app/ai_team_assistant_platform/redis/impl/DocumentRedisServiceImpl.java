package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.DocumentRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
@Service
@RequiredArgsConstructor
public class DocumentRedisServiceImpl implements DocumentRedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void saveSummaryRedis(Long id, String value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getDocumentKey(id), value, duration);
    }

    @Override
    public String getSummaryRedis(Long id) {
        return (String) redisTemplate.opsForValue().get(RedisUtil.getDocumentKey(id));
    }

    @Override
    public void deleteDocsRedis(Long id) {
        redisTemplate.delete(RedisUtil.getDocumentKey(id));
    }
}
