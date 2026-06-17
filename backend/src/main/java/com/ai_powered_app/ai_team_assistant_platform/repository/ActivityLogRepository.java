package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);

    List<ActivityLog> findByUserId(Long userId);

    List<ActivityLog> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

    List<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}
