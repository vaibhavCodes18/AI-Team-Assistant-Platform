package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.AIRequest;
import com.ai_powered_app.ai_team_assistant_platform.enums.AIRequestStatus;
import com.ai_powered_app.ai_team_assistant_platform.enums.AIRequestType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIRequestRepository extends JpaRepository<AIRequest, Long> {

    List<AIRequest> findByUserId(Long userId);

    List<AIRequest> findByWorkspaceId(Long workspaceId);

    List<AIRequest> findByProjectId(Long projectId);

    List<AIRequest> findByStatus(AIRequestStatus status);

    List<AIRequest> findByType(AIRequestType type);

    List<AIRequest> findByUserIdAndStatus(Long userId, AIRequestStatus status);

    List<AIRequest> findByWorkspaceIdAndStatus(Long workspaceId, AIRequestStatus status);
}
