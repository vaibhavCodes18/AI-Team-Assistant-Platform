package com.ai_powered_app.ai_team_assistant_platform.kafka.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.ai_powered_app.ai_team_assistant_platform.email.interfaces.EmailService;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.PasswordResetEmailEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.PasswordResetSuccessEmailEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PasswordResetEmailConsumer {

    private final EmailService emailService;

    public PasswordResetEmailConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    @KafkaListener(
            topics = KafkaTopics.PASSWORD_RESET_EMAIL,
            groupId = "password-reset-email-group",
            containerFactory = "concurrentKafkaListenerContainerFactory"
    )
    public void consumePasswordResetEmailEvent(
            PasswordResetEmailEvent event
    ) {

        log.info(
                "Received password-reset-email event for userId={}",
                event.getUserId()
        );

        emailService.sendResetPasswordEmail(
                event.getEmail(),
                event.getResetLink(),
                event.getUserName()
        );

        log.info(
                "password-reset-email event consumed successfully for userId={}",
                event.getUserId()
        );
    }

    @KafkaListener(
            topics = KafkaTopics.PASSWORD_RESET_SUCCESS_EMAIL,
            groupId = "password-reset-success-email-group",
            containerFactory = "concurrentKafkaListenerContainerFactory"
    )
    public void consumePasswordResetSuccessEmailEvent(
            PasswordResetSuccessEmailEvent event
    ) {

        log.info(
                "Received password-reset-success-email event for userId={}",
                event.getUserId()
        );

        emailService.sendResetPasswordConfirmationEmail(
                event.getEmail(),
                event.getUserName()
        );

        log.info(
                "password-reset-email event consumed successfully for userId={}",
                event.getUserId()
        );
    }
}
