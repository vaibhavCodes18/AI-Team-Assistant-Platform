package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByIdAndStatusNot(Long id, ProjectStatus status);

    List<Project> findByWorkspaceIdOrderByUpdatedAtDesc(Long workspaceId);

    List<Project> findByWorkspaceIdAndStatusNotOrderByUpdatedAtDesc(Long workspaceId, ProjectStatus status);

    List<Project> findByCreatedById(Long userId);

    List<Project> findByStatus(ProjectStatus status);
    @Query("""
                SELECT pm.project
                FROM ProjectMember pm
                WHERE pm.user.id = :userId
                  AND pm.project.workspace.id = :workspaceId
                  AND pm.project.status <> :status
            """)
    List<Project> findAccessibleProjects(
            Long userId,
            Long workspaceId,
            ProjectStatus status);
}
