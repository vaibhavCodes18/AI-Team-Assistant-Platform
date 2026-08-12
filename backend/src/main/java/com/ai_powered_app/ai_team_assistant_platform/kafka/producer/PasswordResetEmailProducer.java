package com.ai_powered_app.ai_team_assistant_platform.kafka.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.ai_powered_app.ai_team_assistant_platform.kafka.event.PasswordResetEmailEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.PasswordResetSuccessEmailEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class PasswordResetEmailProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public PasswordResetEmailProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishPasswordResetEmailEvent(
            PasswordResetEmailEvent event
    ){
        log.info(
                "Publishing password-reset-email event for userId={}",
                event.getUserId()
        );

        kafkaTemplate.send(
                KafkaTopics.PASSWORD_RESET_EMAIL,
                event
        );

        log.info(
                "password-reset-email event published successfully for userId={}",
                event.getUserId()
        );
    }

    public void publishPasswordResetSuccessEmailEvent(
            PasswordResetSuccessEmailEvent event
    ){
        log.info(
                "Publishing password-reset-success-email event for userId={}",
                event.getUserId()
        );

        kafkaTemplate.send(
                KafkaTopics.PASSWORD_RESET_SUCCESS_EMAIL,
                event
        );

        log.info(
                "password-reset-success-email event published successfully for userId={}",
                event.getUserId()
        );
    }
}
