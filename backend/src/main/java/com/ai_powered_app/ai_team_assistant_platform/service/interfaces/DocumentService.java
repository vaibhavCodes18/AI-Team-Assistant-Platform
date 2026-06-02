package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.DocumentRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentResponse;

public interface DocumentService {
    DocumentResponse uploadDocument(DocumentRequest documentRequest);
}
