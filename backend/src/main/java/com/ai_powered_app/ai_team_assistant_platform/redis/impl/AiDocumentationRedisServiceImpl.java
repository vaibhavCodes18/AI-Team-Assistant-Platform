package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.AiDocumentationRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class AiDocumentationRedisServiceImpl implements AiDocumentationRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void saveAiGeneratedResponse(String key, GenerateDocsResponse value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getSourceCodeKey(key), value, duration);
    }

    @Override
    public GenerateDocsResponse getAiGeneratedResponse(String key) {

        return objectMapper.convertValue(
                redisTemplate.opsForValue().get(RedisUtil.getSourceCodeKey(key)),
                GenerateDocsResponse.class
        );
    }
}
