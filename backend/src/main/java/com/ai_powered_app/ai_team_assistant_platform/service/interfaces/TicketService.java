package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;

public interface TicketService {
    TicketResponse createTicket(TicketRequest ticketRequest);
    TicketResponse getTicketById(Long ticketId);
    TicketResponse updateTicket(Long ticketId, TicketUpdateRequest ticketUpdateRequest);
}
