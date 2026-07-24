package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.TaskRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class TaskRedisServiceImpl implements TaskRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public TaskRedisServiceImpl(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void saveTaskRedis(Long id, TaskResponse value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getTaskKey(id), value, duration);
    }

    @Override
    public TaskResponse getTaskRedis(Long id) {
        Object value = redisTemplate.opsForValue().get(RedisUtil.getTaskKey(id));
        if (value != null) {
            return objectMapper.convertValue(value, TaskResponse.class);
        }
        return null;
    }

    @Override
    public void deleteTaskRedis(Long id) {
        redisTemplate.delete(RedisUtil.getTaskKey(id));
    }
}
