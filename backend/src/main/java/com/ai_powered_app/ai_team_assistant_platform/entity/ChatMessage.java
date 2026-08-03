package com.ai_powered_app.ai_team_assistant_platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_chat_room", columnList = "chat_room_id"),
                @Index(name = "idx_sender", columnList = "sender_id"),
                @Index(name = "idx_chat_created", columnList = "chat_room_id,created_at")
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatMessage extends BaseEntity{
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Lob
    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private Boolean edited = false;

    @Column(nullable = false)
    private Boolean deleted = false;
}
