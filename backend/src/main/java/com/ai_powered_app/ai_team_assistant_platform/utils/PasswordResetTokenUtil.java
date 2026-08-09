package com.ai_powered_app.ai_team_assistant_platform.utils;

import com.ai_powered_app.ai_team_assistant_platform.exception.PasswordResetTokenException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
@Slf4j
public class PasswordResetTokenUtil {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public String generateToken(){
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashToken(String token){
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new PasswordResetTokenException("Unable to generate password reset token hash");
        }
    }
}
