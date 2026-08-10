package com.ai_powered_app.ai_team_assistant_platform.entity;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "password_reset_tokens")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PasswordResetToken extends BaseEntity{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;
    
    @Column(name = "is_used", nullable = false)
    private Boolean isUsed;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

}
