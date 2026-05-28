package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Document;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProcessingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByWorkspaceId(Long workspaceId);

    List<Document> findByProjectId(Long projectId);

    List<Document> findByUploadedById(Long userId);

    List<Document> findByProcessingStatus(ProcessingStatus processingStatus);

    List<Document> findByWorkspaceIdAndProcessingStatus(Long workspaceId, ProcessingStatus processingStatus);
}
