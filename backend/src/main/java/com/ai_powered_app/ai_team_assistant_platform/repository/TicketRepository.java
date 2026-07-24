package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.Ticket;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketPriority;
import com.ai_powered_app.ai_team_assistant_platform.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByProjectIdAndStatusNotOrderByUpdatedAtDesc(Long projectId, TicketStatus status);

    List<Ticket> findByReporterId(Long userId);

    List<Ticket> findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    List<Ticket> findByProjectIdAndStatus(Long projectId, TicketStatus status);

    List<Ticket> findByProjectIdAndPriority(Long projectId, TicketPriority priority);

    List<Ticket> findByStatus(TicketStatus status);
}
