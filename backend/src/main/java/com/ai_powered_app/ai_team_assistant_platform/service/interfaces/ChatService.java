package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;


import com.ai_powered_app.ai_team_assistant_platform.dto.response.ChatMessageResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface ChatService {
    /**
     * Returns paginated chat history of a project.
     *
     * @param projectId Project ID
     * @param pageable pagination information
     * @return paginated messages
     */
    PagedResponse<ChatMessageResponse> getProjectMessages(
            Long projectId,
            Pageable pageable
    );

    /**
     * Returns paginated chat history of a ticket.
     *
     * @param ticketId Ticket ID
     * @param pageable pagination information
     * @return paginated messages
     */
    PagedResponse<ChatMessageResponse> getTicketMessages(
            Long ticketId,
            Pageable pageable
    );

}
