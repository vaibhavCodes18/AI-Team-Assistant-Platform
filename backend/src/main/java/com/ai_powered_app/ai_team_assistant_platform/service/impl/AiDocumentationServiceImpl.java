package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.ai.interfaces.AiService;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.AiDocumentationRedisService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AiDocumentationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

@Service
@Slf4j
public class AiDocumentationServiceImpl implements AiDocumentationService {

    private final AiService aiService;

    private final AiDocumentationRedisService aiDocumentationRedisService;

    public AiDocumentationServiceImpl(AiService aiService, AiDocumentationRedisService aiDocumentationRedisService) {
        this.aiService = aiService;
        this.aiDocumentationRedisService = aiDocumentationRedisService;
    }

    @Override
    public GenerateDocsResponse generateDocumentation(List<MultipartFile> files)  {

        if (files == null || files.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Source file is required."
            );
        }

        try {
            StringBuilder sourceCode = new StringBuilder();

            for (MultipartFile file : files) {

                sourceCode.append(
                        new String(
                                file.getBytes(),
                                StandardCharsets.UTF_8
                        )
                );

                sourceCode.append("\n\n");
            }

            GenerateDocsResponse cacheResponse = aiDocumentationRedisService.getAiGeneratedResponse(sourceCode.toString());

            if(cacheResponse != null) return cacheResponse;

            GenerateDocsResponse aiResponse = aiService.generateDocument(sourceCode.toString());

            aiDocumentationRedisService.saveAiGeneratedResponse(sourceCode.toString(), aiResponse, Duration.ofHours(24L));

            return aiResponse;

        } catch (IOException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }


    }
}
