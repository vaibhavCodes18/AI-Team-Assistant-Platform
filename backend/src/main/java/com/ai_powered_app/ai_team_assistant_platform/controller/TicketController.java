package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketRequest ticketRequest){
        TicketResponse response = ticketService.createTicket(ticketRequest);
        ApiResponse<TicketResponse> apiRes = new ApiResponse<>(201, "Ticket created", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

}
