package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<Notification> findByRecipientIdAndIsRead(Long recipientId, Boolean isRead);

    Long countByRecipientIdAndIsRead(Long recipientId, Boolean isRead);
}
