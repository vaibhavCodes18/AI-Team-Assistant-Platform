package com.ai_powered_app.ai_team_assistant_platform.email.impl;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

import com.ai_powered_app.ai_team_assistant_platform.email.interfaces.EmailService;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import org.springframework.beans.factory.annotation.Value;


import org.springframework.scheduling.annotation.Async;


@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:vaibhav.sathe.159@gmail.com}")
    private String fromEmail;

    @Override
    @Async
    public void sendResetPasswordEmail(String to, String resetUrl, String name) {
        try {
            log.info("Preparing password reset email for {} ({})", name, to);
            Context context = new Context();
            context.setVariable("userName", name);
            context.setVariable("resetLink", resetUrl);
            context.setVariable("expiryMinutes", 15);
            context.setVariable("currentYear", java.time.Year.now().getValue());

            String htmlContent = templateEngine.process("password-reset-email", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail, "TeamPilot");
            helper.setTo(to);
            helper.setSubject("Reset Your Password - TeamPilot");
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            log.info("Password reset email successfully sent to {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}", to, e);
            e.printStackTrace();
        }
    }

    @Override
    @Async
    public void sendResetPasswordConfirmationEmail(String to, String name) {
        try {
            log.info("Preparing password reset confirmation email for {} ({})", name, to);
            Context context = new Context();
            context.setVariable("userName", name);
            context.setVariable("currentYear", java.time.Year.now().getValue());

            String htmlContent = templateEngine.process("password-reset-success", context);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail, "TeamPilot");
            helper.setTo(to);
            helper.setSubject("Your Password Has Been Changed - TeamPilot");
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);

            log.info("Password reset confirmation email successfully sent to {}", to);
            
        } catch (Exception e) {
            log.error("Failed to send password reset confirmation email to {}", to, e);
            e.printStackTrace();
        }
    }

}
