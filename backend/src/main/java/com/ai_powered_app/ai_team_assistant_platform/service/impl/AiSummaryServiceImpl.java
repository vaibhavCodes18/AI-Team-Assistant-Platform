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
                content.length() > 15000
                        ? content.substring(0, 15000)
                        : content;

        return chatClient.prompt()
                .system("""
                    You are an expert Technical Documentation Analyst.

                    Your responsibility is to analyze uploaded technical documents
                    and generate professional summaries for software teams.

                    Guidelines:
                    - Focus only on important information.
                    - Ignore decorative text, icons, headers, footers, and formatting noise.
                    - Identify key technologies, concepts, architecture, requirements, and action items.
                    - Keep the summary concise and easy to understand.
                    - Use professional language.
                    - Do not invent information that does not exist in the document.
                    """)
                .user("""
                    Analyze the following document and generate a structured summary.

                    Return the result in the following format:

                    ## Overview
                    Brief explanation of the document.

                    ## Key Concepts
                    - Concept 1
                    - Concept 2
                    - Concept 3

                    ## Important Points
                    - Point 1
                    - Point 2
                    - Point 3

                    ## Technologies Mentioned
                    - Technology 1
                    - Technology 2

                    Document Content:

                    %s
                    """.formatted(truncatedContent))
                .call()
                .content();
    }
}
