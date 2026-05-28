package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Ticket;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByProjectId(Long projectId);

    List<Ticket> findByAssigneeId(Long assigneeId);

    List<Ticket> findByCreatedById(Long userId);

    List<Ticket> findByProjectIdAndStatus(Long projectId, TicketStatus status);

    List<Ticket> findByProjectIdAndPriority(Long projectId, TicketPriority priority);

    List<Ticket> findByAssigneeIdAndStatus(Long assigneeId, TicketStatus status);

    List<Ticket> findByStatus(TicketStatus status);
}
