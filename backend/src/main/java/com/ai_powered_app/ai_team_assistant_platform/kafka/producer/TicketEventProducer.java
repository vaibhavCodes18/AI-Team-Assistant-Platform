package com.ai_powered_app.ai_team_assistant_platform.kafka.producer;

import com.ai_powered_app.ai_team_assistant_platform.kafka.event.TicketCreatedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketEventProducer {

    private final KafkaTemplate<String, TicketCreatedEvent> kafkaTemplate;

    public void publishTicketCreatedEvent(TicketCreatedEvent event) {

        log.info(
                "Publishing ticket-created event for ticketId={}",
                event.getTicketId()
        );

        kafkaTemplate.send(
                KafkaTopics.TICKET_CREATED,
                event
        );

        log.info(
                "ticket-created event published successfully for ticketId={}",
                event.getTicketId()
        );
    }
}
