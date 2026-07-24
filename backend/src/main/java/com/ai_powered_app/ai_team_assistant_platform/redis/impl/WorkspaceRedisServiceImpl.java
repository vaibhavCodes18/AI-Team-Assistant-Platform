package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.WorkspaceRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class WorkspaceRedisServiceImpl implements WorkspaceRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public WorkspaceRedisServiceImpl(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void saveRedisWorkspace(Long id, WorkspaceResponse value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getWorkspaceKey(id), value, Duration.ofMinutes(30L));
    }

    @Override
    public WorkspaceResponse getRedisWorkspace(Long id) {

        Object value = redisTemplate.opsForValue().get(RedisUtil.getWorkspaceKey(id));

        if(value != null){
            return objectMapper.convertValue(value, WorkspaceResponse.class);
        }

        return null;
    }

    @Override
    public void deleteRedisWorkspace(Long id) {
        redisTemplate.delete(RedisUtil.getWorkspaceKey(id));
    }
}
