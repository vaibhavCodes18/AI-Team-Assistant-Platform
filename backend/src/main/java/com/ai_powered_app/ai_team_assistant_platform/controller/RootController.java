package com.ai_powered_app.ai_team_assistant_platform.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "TeamPilot - AI-Powered Team Collaboration Platform Server is started now successfully!"));
    }
}
