package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectResponse;

public interface ProjectService {
     ProjectResponse createProject(ProjectRequest projectRequest);
     ProjectResponse getProjectById(Long projectId);
}
