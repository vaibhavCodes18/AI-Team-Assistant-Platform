package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TaskComment, Long> {

    List<TaskComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    List<TaskComment> findByUserId(Long userId);
}
