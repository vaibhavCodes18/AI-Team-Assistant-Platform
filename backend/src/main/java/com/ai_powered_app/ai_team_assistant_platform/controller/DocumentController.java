package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.DocumentRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentViewResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.DocumentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<DocumentViewResponse>> getDocument(@PathVariable("documentId") Long documentId){
        DocumentViewResponse documentResponse = documentService.getDocumentById(documentId);
        ApiResponse<DocumentViewResponse> apiResponse = new ApiResponse<>(200, "Document fetched", documentResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<ApiResponse<List<DocumentViewResponse>>> getDocumentsByWorkspace(@PathVariable("workspaceId") Long documentId){
        List<DocumentViewResponse> documentResponse = documentService.getDocumentsByWorkspace(documentId);
        ApiResponse<List<DocumentViewResponse>> apiResponse = new ApiResponse<>(200, "Documents fetched", documentResponse);
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }
    
    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable("documentId") Long documentId){
        DocumentViewResponse document = documentService.getDocumentById(documentId);
        Resource resource = documentService.downloadDocument(documentId);
        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                document.getFileType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                document.getFileName() +
                                "\""
                )
                .body(resource);
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable("documentId") Long documentId){
        documentService.deleteDocument(documentId);
        ApiResponse<Void> apiResponse = new ApiResponse<>(200, "Documents deleted", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    @GetMapping("/{documentId}/summary")
    public ResponseEntity<ApiResponse<String>> getDocumentAiSummary(@PathVariable("documentId") Long documentId){
        String summary = documentService.getAiSummary(documentId);
        ApiResponse<String> apiResponse = new ApiResponse<>(200, "Documents summary fetched", summary);
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }



}
