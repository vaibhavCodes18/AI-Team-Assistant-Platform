package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotifications();
}
