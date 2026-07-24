package com.ai_powered_app.ai_team_assistant_platform.redis.impl;

import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.JwtBlacklistService;
import com.ai_powered_app.ai_team_assistant_platform.utils.RedisUtil;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class JwtBlacklistServiceImpl implements JwtBlacklistService {

    private final RedisTemplate<String, Object> redisTemplate;

    public JwtBlacklistServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void saveBlackListJwt(String token, String type, Duration duration) {
        redisTemplate.opsForValue().set(RedisUtil.getBlacklistKey(type,token), true, duration);
    }


    @Override
    public boolean blackListTokenExist(String token, String type) {
        Object value = redisTemplate.opsForValue().get(RedisUtil.getBlacklistKey(type,token));
        return value != null;
    }
}
