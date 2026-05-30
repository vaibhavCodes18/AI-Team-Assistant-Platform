package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    Optional<Workspace> findBySlug(String slug);

    Boolean existsBySlug(String slug);

    List<Workspace> findByOwner(User owner);


    List<Workspace> findByOwnerId(Long ownerId);

    List<Workspace> findByIsActive(Boolean isActive);
}
