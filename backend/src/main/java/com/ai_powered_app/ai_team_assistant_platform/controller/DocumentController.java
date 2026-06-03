package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.DocumentRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.DocumentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(@Valid @ModelAttribute DocumentRequest documentRequest){
        DocumentResponse documentResponse = documentService.uploadDocument(documentRequest);
        ApiResponse<DocumentResponse> apiResponse = new ApiResponse<>(200, "Document uploaded", documentResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

}
