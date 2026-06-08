package com.ai_powered_app.ai_team_assistant_platform.utils;

import java.util.Date;

public class CalculateRemainingTime {
    public static long calculateTime(Date expirationAccessDate){
        return
                expirationAccessDate.getTime()
                        - System.currentTimeMillis();
    }
}
