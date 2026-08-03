package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByProjectId(Long projectId);

    Optional<ChatRoom> findByTicketId(Long ticketId);


}
