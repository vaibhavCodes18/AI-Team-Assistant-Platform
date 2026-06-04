package com.ai_powered_app.ai_team_assistant_platform.kafka.consumer;

import com.ai_powered_app.ai_team_assistant_platform.entity.Notification;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.enums.NotificationType;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.TicketCreatedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;
import com.ai_powered_app.ai_team_assistant_platform.repository.NotificationRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @KafkaListener(
            topics = KafkaTopics.TICKET_CREATED,
            groupId = "ticket-group",
            containerFactory = "ticketKafkaListenerContainerFactory"
    )
    public void consumeTicketCreatedEvent(
            TicketCreatedEvent event
    ) {

        log.info(
                "Received ticket-created event. ticketId={}",
                event.getTicketId()
        );

        if (event.getAssignedUserId() == null) {
            return;
        }

        User assignee = userRepository
                .findById(event.getAssignedUserId())
                .orElse(null);

        if (assignee == null) {
            return;
        }

        Notification notification = new Notification();

        notification.setUser(assignee);

        notification.setTitle(
                "Ticket Assigned"
        );

        notification.setMessage(
                "You have been assigned ticket: "
                        + event.getTitle()
        );

        notification.setType(
                NotificationType.TICKET_ASSIGNED
        );

        notification.setIsRead(false);

        notificationRepository.save(notification);

        log.info(
                "Notification created successfully for userId={}",
                assignee.getId()
        );
    }
}