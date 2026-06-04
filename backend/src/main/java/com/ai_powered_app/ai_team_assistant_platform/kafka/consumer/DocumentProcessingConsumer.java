package com.ai_powered_app.ai_team_assistant_platform.kafka.consumer;

import com.ai_powered_app.ai_team_assistant_platform.kafka.event.DocumentUploadedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.topic.KafkaTopics;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.DocumentProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessingConsumer {

    private final DocumentProcessingService documentProcessingService;

    @KafkaListener(
            topics = KafkaTopics.DOCUMENT_UPLOADED,
            groupId = "document-group",
            containerFactory = "documentKafkaListenerContainerFactory"
    )
    public void consumeDocumentUploadedEvent(
            DocumentUploadedEvent event
    ) {

        log.info(
                "Received document-uploaded event. documentId={}",
                event.getDocumentId()
        );

        documentProcessingService.processDocument(
                event.getDocumentId()
        );
    }
}
