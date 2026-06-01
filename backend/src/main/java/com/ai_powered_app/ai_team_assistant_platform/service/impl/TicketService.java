package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;

public interface TicketService {
    TicketResponse createTicket(TicketRequest ticketRequest);
}
