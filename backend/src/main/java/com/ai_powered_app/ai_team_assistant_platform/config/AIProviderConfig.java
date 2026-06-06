package com.ai_powered_app.ai_team_assistant_platform.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIProviderConfig {

    @Bean
    public ChatClient ollamaChatClient(
            GoogleGenAiChatModel genAiChatModel
    ) {
        return ChatClient.create(genAiChatModel);
    }

}
