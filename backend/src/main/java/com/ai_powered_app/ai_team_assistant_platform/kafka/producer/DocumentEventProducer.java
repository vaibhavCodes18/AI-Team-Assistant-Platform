package com.ai_powered_app.ai_team_assistant_platform.kafka.producer;

import com.ai_powered_app.ai_team_assistant_platform.kafka.event.DocumentUploadedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DocumentEventProducer {

    private final KafkaTemplate<String, Object
            > kafkaTemplate;

    public void publishDocumentUploadedEvent(
            DocumentUploadedEvent event
    ){
        log.info(
                "Publishing document-uploaded event for documentId={}",
                event.getDocumentId()
        );

        kafkaTemplate.send(
                KafkaTopics.DOCUMENT_UPLOADED,
                event
        );

        log.info(
                "document-uploaded event published successfully for documentId={}",
                event.getDocumentId()
        );
    }
}
