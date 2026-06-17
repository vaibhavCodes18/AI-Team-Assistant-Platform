package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ActivityLogRequest;
import com.ai_powered_app.ai_team_assistant_platform.entity.ActivityLog;
import com.ai_powered_app.ai_team_assistant_platform.repository.ActivityLogRepository;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Override
    public void logActivity(ActivityLogRequest request) {

        ActivityLog activityLog = new ActivityLog();

        activityLog.setWorkspace(request.getWorkspace());
        activityLog.setUser(request.getUser());
        activityLog.setAction(request.getAction().name());
        activityLog.setEntityType(request.getEntityType().name());
        activityLog.setEntityId(request.getEntityId());
        activityLog.setMetadata(request.getMetadata());

        activityLogRepository.save(activityLog);
    }
}
