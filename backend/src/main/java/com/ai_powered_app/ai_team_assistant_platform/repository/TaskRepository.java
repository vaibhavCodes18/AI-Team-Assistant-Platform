package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Task;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    List<Task> findByAssignedToId(Long userId);

    @Query("SELECT t FROM Task t JOIN WorkspaceMember wm ON t.workspace.id = wm.workspace.id " +
           "WHERE wm.user.id = :userId AND (wm.role = com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole.OWNER " +
           "OR wm.role = com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole.ADMIN) " +
           "AND t.dueDate < :today AND t.status != com.ai_powered_app.ai_team_assistant_platform.enums.TaskStatus.DONE AND t.archived = false")
    List<Task> findOverdueTasksForOwnerOrAdmin(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t JOIN WorkspaceMember wm ON t.workspace.id = wm.workspace.id " +
           "WHERE wm.user.id = :userId AND " +
           "(:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:assignedUserId IS NULL OR t.assignedTo.id = :assignedUserId) AND " +
           "(:projectId IS NULL OR t.project.id = :projectId) AND " +
           "t.archived = false")
    List<Task> searchTasksForUser(@Param("userId") Long userId,
                                  @Param("keyword") String keyword,
                                  @Param("status") TaskStatus status,
                                  @Param("priority") TaskPriority priority,
                                  @Param("assignedUserId") Long assignedUserId,
                                  @Param("projectId") Long projectId);
}

