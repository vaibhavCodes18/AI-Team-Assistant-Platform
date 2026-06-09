package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.GenerateDocsRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.GenerateDocsResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AiDocumentationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiDocumentationService aiDocumentationService;

    @PostMapping(
            value = "/generate-docs",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<GenerateDocsResponse>>
    generateDocumentation(
            @RequestParam("files")
            List<MultipartFile> files
    ) {

        GenerateDocsResponse response =
                aiDocumentationService.generateDocumentation(files);

        ApiResponse<GenerateDocsResponse> apiResponse =
                new ApiResponse<>(
                        200,
                        "Documentation generated successfully.",
                        response
                );

        return ResponseEntity.ok(apiResponse);
    }

}
