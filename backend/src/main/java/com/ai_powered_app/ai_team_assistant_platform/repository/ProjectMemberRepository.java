package com.ai_powered_app.ai_team_assistant_platform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ai_powered_app.ai_team_assistant_platform.entity.ProjectMember;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    List<ProjectMember> findByProjectId(Long projectId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    List<ProjectMember> findByUserIdAndProjectWorkspaceId(
        Long userId,
        Long workspaceId
);

    List<ProjectMember> findByUserId(Long userId);

    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}
