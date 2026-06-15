package com.ai_powered_app.ai_team_assistant_platform.ai.impl;

import com.ai_powered_app.ai_team_assistant_platform.ai.interfaces.AiService;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.repository.ActivityLogRepository;
import com.ai_powered_app.ai_team_assistant_platform.utils.AiPrompt;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class AiServiceImpl implements AiService {
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final ActivityLogRepository activityLogRepository;

    @Override
    public String generateSummary(String content) {

        if (content == null || content.isBlank()) {
            return "Document contains no readable content.";
        }

        String truncatedContent =
                content.length() > 15000
                        ? content.substring(0, 15000)
                        : content;

        return chatClient.prompt()
                .user(AiPrompt.DOCUMENT_SUMMARY_PROMPT.formatted(truncatedContent))
                .call()
                .content();
    }

    @Override
    public GenerateDocsResponse generateDocument(
            String sourceCode
    ) {

        validateSourceCode(sourceCode);

        String prompt =
                AiPrompt.API_DOCUMENTATION_PROMPT
                        .formatted(sourceCode);

        try {

            String aiResponse = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return objectMapper.readValue(
                    sanitizeResponse(aiResponse),
                    GenerateDocsResponse.class
            );

        } catch (Exception ex) {

            log.error(
                    "AI documentation generation failed",
                    ex
            );

            throw new RuntimeException(
                    "AI service is temporarily unavailable. Please try again later."
            );
        }
    }

    private void validateSourceCode(
            String sourceCode
    ) {

        if (sourceCode == null ||
                sourceCode.isBlank()) {

            throw new ResourceNotFoundException(
                    "Source code is invalid"
            );
        }
    }

    private String sanitizeResponse(
            String response
    ) {

        return response
                .replace("```json", "")
                .replace("```", "")
                .replaceAll("[\\r\\n]+", " ")
                .trim();
    }
}
