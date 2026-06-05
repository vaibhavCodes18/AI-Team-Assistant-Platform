package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.DocumentRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentViewResponse;

import java.util.List;

public interface DocumentService {
    DocumentResponse uploadDocument(DocumentRequest documentRequest);
    DocumentViewResponse getDocumentById(Long documentId);
    List<DocumentViewResponse> getDocumentsByWorkspace(Long workspaceId);
}
