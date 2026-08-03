package com.ai_powered_app.ai_team_assistant_platform.mapper.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.ChatMessageResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.ChatMessage;

import java.util.List;

public interface ChatMapper {
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);

    List<ChatMessageResponse> toChatMessageResponseList(List<ChatMessage> messages);
}
