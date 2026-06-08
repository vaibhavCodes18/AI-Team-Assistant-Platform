package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.WorkspaceRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class WorkspaceRedisServiceImpl implements WorkspaceRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

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
