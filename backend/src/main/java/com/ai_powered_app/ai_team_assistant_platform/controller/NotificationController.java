package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.NotificationResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(){
        List<NotificationResponse> response = notificationService.getNotifications();

        ApiResponse<List<NotificationResponse>> apiRes = new ApiResponse<>(200, "Notification fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long notificationId) {
        NotificationResponse response = notificationService.markAsRead(notificationId);
        ApiResponse<NotificationResponse> apiRes = new ApiResponse<>(200, "Notification marked as read", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        ApiResponse<Void> apiRes = new ApiResponse<>(200, "Notification deleted successfully", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

}
