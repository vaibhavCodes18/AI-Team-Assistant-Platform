package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.DocumentRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.Document;
import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProcessingStatus;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.DocumentUploadedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.producer.DocumentEventProducer;
import com.ai_powered_app.ai_team_assistant_platform.repository.DocumentRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.ProjectRepository;
import com.ai_powered_app.ai_team_assistant_platform.repository.UserRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.DocumentService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.FileStorageService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;

    private final ProjectRepository projectRepository;

    private final UserRepository userRepository;

    private final FileStorageService fileStorageService;

    private final DocumentEventProducer documentEventProducer;

    public DocumentServiceImpl(DocumentRepository documentRepository, ProjectRepository projectRepository, UserRepository userRepository, FileStorageService fileStorageService, DocumentEventProducer documentEventProducer) {
        this.documentRepository = documentRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.documentEventProducer = documentEventProducer;
    }

    @Override
    public DocumentResponse uploadDocument(DocumentRequest documentRequest) {
        User currentUser = getAuthenticateUser();

        Project project = projectRepository.findById(documentRequest.getProjectId()).orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        String storagePath  = fileStorageService.storeFile(documentRequest.getFile(), project.getWorkspace().getId());

        Document document = new Document();

        document.setWorkspace(
                project.getWorkspace()
        );

        document.setProject(project);

        document.setUploadedBy(currentUser);

        document.setTitle(document.getTitle());

        document.setFileName(
                documentRequest.getFile().getOriginalFilename()
        );

        document.setFileType(
                documentRequest.getFile().getContentType()
        );

        document.setFileSize(
                documentRequest.getFile().getSize()
        );

        document.setStoragePath(
                storagePath
        );

        document.setProcessingStatus(
                ProcessingStatus.UPLOADED
        );

        Document savedDocument = documentRepository.save(document);

        DocumentUploadedEvent event =
                DocumentUploadedEvent.builder()
                        .documentId(
                                savedDocument.getId()
                        )
                        .workspaceId(
                                project.getWorkspace().getId()
                        )
                        .projectId(
                                project.getId()
                        )
                        .uploadedByUserId(
                                currentUser.getId()
                        )
                        .title(
                                savedDocument.getTitle()
                        )
                        .uploadedAt(
                                savedDocument.getCreatedAt()
                        )
                        .build();

        documentEventProducer
                .publishDocumentUploadedEvent(
                        event
                );

        return mapToDocumentResponse(savedDocument);
    }

    private DocumentResponse mapToDocumentResponse(Document savedDocument){
        return DocumentResponse.builder()
                .id(savedDocument.getId())
                .title(savedDocument.getTitle())
                .fileName(savedDocument.getFileName())
                .fileType(savedDocument.getFileType())
                .fileSize(savedDocument.getFileSize())
                .summary(savedDocument.getSummary())
                .processingStatus(
                        savedDocument.getProcessingStatus()
                )
                .build();
    }

    private User getAuthenticateUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
    }
}
