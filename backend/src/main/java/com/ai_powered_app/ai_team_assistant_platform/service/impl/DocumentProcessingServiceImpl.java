package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.entity.Document;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProcessingStatus;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.redis.DocumentRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.DocumentRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AiSummaryService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.DocumentProcessingService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TextExtractionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class DocumentProcessingServiceImpl implements DocumentProcessingService {

    private final DocumentRepository documentRepository;

    private final TextExtractionService textExtractionService;

    private final AiSummaryService aiSummaryService;

    private final DocumentRedisService redisService;

    @Override
    @Transactional
    public void processDocument(Long documentId) {
        Document document = documentRepository.findById(documentId).orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        try {

            log.info(
                    "Starting document processing. documentId={}",
                    documentId
            );

            document.setProcessingStatus(
                    ProcessingStatus.PROCESSING
            );

            documentRepository.save(document);

            String extractedText =
                    textExtractionService.extractText(
                            document.getStoragePath()
                    );

            if (extractedText.isBlank()) {
                throw new ResourceNotFoundException(
                        "No content found in document"
                );
            }

            String summary =
                    aiSummaryService.generateSummary(
                            extractedText
                    );
            redisService.saveSummaryRedis(document.getId(), summary, Duration.ofMinutes(10L));
            document.setSummary(summary);

            document.setProcessingStatus(
                    ProcessingStatus.COMPLETED
            );

            documentRepository.save(document);

            log.info(
                    "Document processed successfully. documentId={}",
                    documentId
            );

        } catch (Exception ex) {

            log.error(
                    "Document processing failed. documentId={}",
                    documentId,
                    ex
            );

            document.setProcessingStatus(
                    ProcessingStatus.FAILED
            );

            documentRepository.save(document);
        }
    }
}
