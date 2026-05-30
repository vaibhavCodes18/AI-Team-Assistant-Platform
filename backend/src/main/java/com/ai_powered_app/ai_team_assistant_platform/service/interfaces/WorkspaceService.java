package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;

public interface WorkspaceService {
    WorkspaceResponse createWorkspace(WorkspaceRequest workspaceRequest);
    WorkspaceResponse getWorkspaceById(Long workspaceId);
    WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceUpdateRequest workspaceUpdateRequest);
}
//•	create workspace - done
//•	invite member
//•	remove member
//•	update member role