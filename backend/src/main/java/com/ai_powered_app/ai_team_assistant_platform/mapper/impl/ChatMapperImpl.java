package com.ai_powered_app.ai_team_assistant_platform.mapper.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.ChatMessageResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.ChatMessage;
import com.ai_powered_app.ai_team_assistant_platform.mapper.interfaces.ChatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ChatMapperImpl implements ChatMapper {

    @Override
    public ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {

        if (chatMessage == null) {
            return null;
        }

        return ChatMessageResponse.builder()
                .id(chatMessage.getId())
                .senderId(chatMessage.getSender().getId())
                .senderName(chatMessage.getSender().getName())
                .senderProfileImage(chatMessage.getSender().getProfileImage())
                .message(chatMessage.getMessage())
                .edited(chatMessage.getEdited())
                .createdAt(chatMessage.getCreatedAt())
                .build();
    }

    @Override
    public List<ChatMessageResponse> toChatMessageResponseList(List<ChatMessage> messages) {

        return messages.stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

}
