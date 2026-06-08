package com.ai_powered_app.ai_team_assistant_platform.redis.interfaces;

import java.time.Duration;

public interface JwtBlacklistService {
    void saveBlackListJwt(String token, String type, Duration duration);
    boolean blackListTokenExist(String token,String type);
}
