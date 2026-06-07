package com.ai_powered_app.ai_team_assistant_platform.utils;

public class RedisUtil {
    public static String getKey(Long id){
        System.out.println("document-" + id);
        return "document-" + id;
    }
}
