package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByWorkspaceIdOrderByUpdatedAtDesc(Long workspaceId);

    List<Project> findByWorkspaceIdAndStatus(Long workspaceId, ProjectStatus status);

    List<Project> findByCreatedById(Long userId);

    List<Project> findByStatus(ProjectStatus status);
}
