package com.ai_powered_app.ai_team_assistant_platform.email.interfaces;


public interface EmailService {
    void sendResetPasswordEmail(String to, String resetUrl, String name);

    void sendResetPasswordConfirmationEmail(String to, String name) ;

}
