package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AiSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AiSummaryServiceImpl implements AiSummaryService {
    private final ChatClient chatClient;

    @Override
    public String generateSummary(String content) {

        if (content == null || content.isBlank()) {
            return "Document contains no readable content.";
        }

        String truncatedContent =
                content.length() > 1000
                        ? content.substring(0, 1000)
                        : content;

        return chatClient.prompt()
                .system("""
                    You are a senior software architect.
                    
                    Your task is to summarize technical documents.
                    
                    Output format:
                    
                    1. Overview
                    2. Key Concepts
                    3. Important Points
                    
                    Keep the summary concise and professional.
                    Focus on important technical details only.
                    """)
                .user("""
                    Summarize the following document.

                    Requirements:
                    - Maximum 10 bullet points
                    - Professional tone
                    - Highlight important concepts
                    - Keep summary concise

                    Document:
                    %s
                    """.formatted(truncatedContent))
                .call()
                .content();
    }
}
