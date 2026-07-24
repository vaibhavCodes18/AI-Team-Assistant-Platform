package com.ai_powered_app.ai_team_assistant_platform.utils;

import org.springframework.util.DigestUtils;

public class RedisUtil {
    public static String getSummaryKey(Long id){
        return "summary-" + id;
    }

    public static String getDocumentKey(Long id){
        return "document-" + id;
    }

    public static String getUserKey(Long id){
        return "user-" + id;
    }

    public static String getWorkspaceKey(Long id){
        return "workspace-" + id;
    }

    public static String getTaskKey(Long id){
        return "task-" + id;
    }

    public static String getTicketsKey(Long id){
        return "tickets-" + id;
    }

    public static String getBlacklistKey(String type, String token){
        return "blacklist-"+ type + "-" + token;
    }

    public static String getSourceCodeKey(String sourceCode){

        System.out.println("docs:" +
                DigestUtils.md5DigestAsHex(
                        sourceCode.getBytes()
                ));

        return "docs:" +
                DigestUtils.md5DigestAsHex(
                        sourceCode.getBytes()
                );
    }



}
