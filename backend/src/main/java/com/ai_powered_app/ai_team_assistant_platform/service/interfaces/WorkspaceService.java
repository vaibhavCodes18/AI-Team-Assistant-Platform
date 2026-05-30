package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;

public interface WorkspaceService {
    WorkspaceResponse createWorkspace(WorkspaceRequest workspaceRequest);
}
//•	create workspace
//•	invite member
//•	remove member
//•	update member role