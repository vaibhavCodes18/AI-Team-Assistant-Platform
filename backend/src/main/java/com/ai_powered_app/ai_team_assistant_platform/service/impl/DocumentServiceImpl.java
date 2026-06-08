package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.DocumentRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.DocumentViewResponse;
import com.ai_powered_app.ai_team_assistant_platform.entity.*;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProcessingStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import com.ai_powered_app.ai_team_assistant_platform.exception.AccessDeniedException;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.kafka.event.DocumentUploadedEvent;
import com.ai_powered_app.ai_team_assistant_platform.kafka.producer.DocumentEventProducer;
import com.ai_powered_app.ai_team_assistant_platform.redis.interfaces.DocumentRedisService;
import com.ai_powered_app.ai_team_assistant_platform.repository.*;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.DocumentService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

        private final DocumentRepository documentRepository;

        private final ProjectRepository projectRepository;

        private final UserRepository userRepository;

        private final FileStorageService fileStorageService;

        private final DocumentEventProducer documentEventProducer;

        private final WorkspaceMemberRepository workspaceMemberRepository;

        private final WorkspaceRepository workspaceRepository;

        private final DocumentRedisService redisService;

        @Override
        public DocumentResponse uploadDocument(DocumentRequest documentRequest) {
                User currentUser = getAuthenticateUser();

                Project project = projectRepository.findById(documentRequest.getProjectId())
                                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

                String storagePath = fileStorageService.storeFile(documentRequest.getFile(),
                                project.getWorkspace().getId());

                Document document = new Document();

                document.setWorkspace(
                                project.getWorkspace());

                document.setProject(project);

                document.setUploadedBy(currentUser);

                document.setTitle(documentRequest.getTitle());

                document.setFileName(
                                documentRequest.getFile().getOriginalFilename());

                document.setFileType(
                                documentRequest.getFile().getContentType());

                document.setFileSize(
                                documentRequest.getFile().getSize());

                document.setStoragePath(
                                storagePath);

                document.setProcessingStatus(
                                ProcessingStatus.UPLOADED);

                Document savedDocument = documentRepository.save(document);

                DocumentUploadedEvent event = DocumentUploadedEvent.builder()
                                .documentId(
                                                savedDocument.getId())
                                .workspaceId(
                                                project.getWorkspace().getId())
                                .projectId(
                                                project.getId())
                                .uploadedByUserId(
                                                currentUser.getId())
                                .title(
                                                savedDocument.getTitle())
                                .uploadedAt(
                                                savedDocument.getCreatedAt())
                                .build();

                documentEventProducer
                                .publishDocumentUploadedEvent(
                                                event);

                return mapToDocumentResponse(savedDocument);
        }

        @Override
        public DocumentViewResponse getDocumentById(Long documentId) {

                User currentUser = getAuthenticateUser();

                Document document = documentRepository.findById(documentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

                if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(document.getWorkspace().getId(),
                                currentUser.getId())) {
                        throw new AccessDeniedException("You are not a member of this workspace");
                }

                return mapToDocumentViewResponse(document);
        }

        @Override
        public List<DocumentViewResponse> getDocumentsByWorkspace(Long workspaceId) {

                User currentUser = getAuthenticateUser();

                if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
                        throw new AccessDeniedException("You are not a member of this workspace");
                }

                List<Document> documents = documentRepository.findByWorkspaceId(workspaceId);

                return documents.stream().map(this::mapToDocumentViewResponse).collect(Collectors.toList());
        }

        @Override
        public Resource downloadDocument(Long documentId) {
                User currentUser = getAuthenticateUser();

                Document document = documentRepository.findById(documentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

                if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(document.getWorkspace().getId(),
                                currentUser.getId())) {
                        throw new AccessDeniedException("You are not a member of this workspace");
                }
                return fileStorageService.loadFile(document.getStoragePath());
        }

        @Override
        public void deleteDocument(Long documentId) {
                User currentUser = getAuthenticateUser();

                Document document = documentRepository.findById(documentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

                WorkspaceMember member = workspaceMemberRepository
                                .findByWorkspaceIdAndUserId(document.getWorkspace().getId(), currentUser.getId())
                                .orElseThrow(() -> new AccessDeniedException("You are not a member of this workspace"));

                if (member.getRole() != WorkspaceRole.ADMIN && member.getRole() != WorkspaceRole.OWNER) {
                        throw new AccessDeniedException("Only OWNER or ADMIN can delete document");
                }

                try {
                        fileStorageService.deleteFile(document.getStoragePath());
                } catch (IOException e) {
                        throw new RuntimeException("Failed to delete file from storage: " + e.getMessage(), e);
                }

                documentRepository.deleteById(documentId);

        }

        @Override
        public String getAiSummary(Long documentId) {
                User currentUser = getAuthenticateUser();

                Document document = documentRepository.findById(documentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

                if (!workspaceMemberRepository.existsByWorkspaceIdAndUserId(document.getWorkspace().getId(),
                        currentUser.getId())) {
                        throw new AccessDeniedException("You are not a member of this workspace");
                }

                String redisSummary = redisService.getSummaryRedis(documentId);

                if(redisSummary != null){
                        return redisSummary;
                }

                redisService.saveSummaryRedis(documentId, document.getSummary(), Duration.ofMinutes(10L));

                return document.getSummary();
        }

        private DocumentViewResponse mapToDocumentViewResponse(Document savedDocument) {
                return DocumentViewResponse.builder()
                                .workspaceId(savedDocument.getWorkspace().getId())
                                .projectId(savedDocument.getProject().getId())
                                .uploadedById(savedDocument.getUploadedBy().getId())
                                .id(savedDocument.getId())
                                .title(savedDocument.getTitle())
                                .fileName(savedDocument.getFileName())
                                .fileType(savedDocument.getFileType())
                                .fileSize(savedDocument.getFileSize())
                                .processingStatus(
                                                savedDocument.getProcessingStatus())
                                .summary(savedDocument.getSummary())
                                .createdAt(savedDocument.getCreatedAt())
                                .updatedAt(savedDocument.getUpdatedAt())
                                .build();
        }

        private DocumentResponse mapToDocumentResponse(Document savedDocument) {

                return DocumentResponse.builder()
                                .workspaceId(savedDocument.getWorkspace().getId())
                                .projectId(savedDocument.getProject().getId())
                                .uploadedById(savedDocument.getUploadedBy().getId())
                                .id(savedDocument.getId())
                                .title(savedDocument.getTitle())
                                .fileName(savedDocument.getFileName())
                                .fileType(savedDocument.getFileType())
                                .fileSize(savedDocument.getFileSize())
                                .processingStatus(
                                                savedDocument.getProcessingStatus())
                                .build();
        }

        private User getAuthenticateUser() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email."));
        }
}
