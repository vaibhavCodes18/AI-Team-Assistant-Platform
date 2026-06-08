package com.ai_powered_app.ai_team_assistant_platform.utils;

public class RedisUtil {
    public static String getDocumentKey(Long id){
        return "document-" + id;
    }

    public static String getUserKey(Long id){
        return "user-" + id;
    }

    public static String getWorkspaceKey(Long id){
        return "workspace-" + id;
    }

}
