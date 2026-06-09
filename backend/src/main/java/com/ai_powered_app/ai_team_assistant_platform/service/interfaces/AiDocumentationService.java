package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AiDocumentationService {
    GenerateDocsResponse generateDocumentation(List<MultipartFile> files) ;
}
