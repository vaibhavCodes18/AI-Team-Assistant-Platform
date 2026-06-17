package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.NotificationRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getNotifications();
    NotificationResponse markAsRead(Long notificationId);
    void deleteNotification(Long notificationId);
    void sendNotification(NotificationRequest request);
}
