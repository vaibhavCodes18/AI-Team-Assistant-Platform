package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ActivityLogRequest;

public interface ActivityLogService {
    void logActivity(ActivityLogRequest request);
}
