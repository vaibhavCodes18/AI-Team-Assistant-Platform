package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import java.util.List;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketDetailedResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketSummaryResponse;

public interface TicketService {
    TicketSummaryResponse createTicket(TicketRequest ticketRequest);
    TicketDetailedResponse getTicketById(Long ticketId);
    TicketSummaryResponse updateTicket(Long ticketId, TicketUpdateRequest ticketUpdateRequest);
    void deleteTicket(Long ticketId);
    List<TaskResponse> getTicketTasks(Long ticketId);
}
