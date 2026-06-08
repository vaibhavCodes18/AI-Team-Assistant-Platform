package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentViewResponse;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.DocumentRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class DocumentRedisServiceImpl implements DocumentRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void saveDocumentRedis(Long id, DocumentViewResponse value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getDocumentKey(id), value, Duration.ofMinutes(10L));
    }

    @Override
    public DocumentViewResponse getDocumentRedis(Long id) {

        Object value = redisTemplate.opsForValue().get(RedisUtil.getDocumentKey(id));

        if(value != null) return objectMapper.convertValue(value, DocumentViewResponse.class);

        return null;
    }

    @Override
    public void deleteDocumentRedis(Long id) {
        redisTemplate.delete(RedisUtil.getDocumentKey(id));
    }
}
