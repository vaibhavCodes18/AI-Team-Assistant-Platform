package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.UserResponse;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.UserRedisService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class UserRedisServiceImpl implements UserRedisService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void saveRedisUser(Long id, UserResponse value, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getUserKey(id), value, Duration.ofMinutes(10L));
    }

    @Override
    public UserResponse getRedisUser(Long id) {
        Object value =
                redisTemplate.opsForValue()
                        .get(RedisUtil.getUserKey(id));

        if (value == null) {
            return null;
        }

        return objectMapper.convertValue(
                value,
                UserResponse.class
        );
    }

    @Override
    public void deleteRedisUser(Long id) {
        redisTemplate.delete(RedisUtil.getUserKey(id));
    }
}
