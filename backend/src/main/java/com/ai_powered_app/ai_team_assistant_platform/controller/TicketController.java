package com.ai_powered_app.ai_team_assistant_platform.controller;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.TicketUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TaskResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.TicketResponse;
import com.ai_powered_app.ai_team_assistant_platform.response.ApiResponse;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TicketService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketRequest ticketRequest){
        TicketResponse response = ticketService.createTicket(ticketRequest);
        ApiResponse<TicketResponse> apiRes = new ApiResponse<>(201, "Ticket created", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiRes);
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicket(@PathVariable("ticketId") Long ticketId){
        TicketResponse response = ticketService.getTicketById(ticketId);
        ApiResponse<TicketResponse> apiRes = new ApiResponse<>(200, "Ticket fetched", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @PutMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(@PathVariable("ticketId") Long ticketId, @Valid @RequestBody TicketUpdateRequest ticketUpdateRequest){
        TicketResponse response = ticketService.updateTicket(ticketId, ticketUpdateRequest);
        ApiResponse<TicketResponse> apiRes = new ApiResponse<>(200, "Ticket updated", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<ApiResponse<Void>> removeTicket(@PathVariable("ticketId") Long ticketId){
        ticketService.deleteTicket(ticketId);
        ApiResponse<Void> apiRes = new ApiResponse<>(200, "Ticket deleted", null);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }
    @GetMapping("/{ticketId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTicketTasks(@PathVariable("ticketId") Long ticketId){
        List<TaskResponse> response =  ticketService.getTicketTasks(ticketId);
        ApiResponse<List<TaskResponse>> apiRes = new ApiResponse<>(200, "Ticket deleted", response);
        return ResponseEntity.status(HttpStatus.OK).body(apiRes);
    }

}
