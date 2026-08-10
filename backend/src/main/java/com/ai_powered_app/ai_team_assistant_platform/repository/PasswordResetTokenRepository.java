package com.ai_powered_app.ai_team_assistant_platform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ai_powered_app.ai_team_assistant_platform.entity.PasswordResetToken;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long>{
    Optional<PasswordResetToken> findByTokenHashAndIsUsedFalse(String tokenHash);

    void deleteByUser(User user);

    @Modifying
    @Query("""
        UPDATE PasswordResetToken t
        SET t.isUsed = true
        WHERE t.user.id = :userId
          AND t.isUsed = false
    """)
    int invalidatePreviousTokens(@Param("userId") Long userId);

}
