package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.AiSummaryService;
import org.springframework.stereotype.Service;

@Service
public class AiSummaryServiceImpl implements AiSummaryService {
    @Override
    public String generateSummary(String content) {
        return content.substring(
                0,
                Math.min(
                        content.length(),
                        500
                )
        );
    }
}
