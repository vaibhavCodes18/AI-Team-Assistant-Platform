package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceMemberRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.WorkspaceRoleUpdateRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.WorkspaceMemberResponse;
import java.util.List;

public interface WorkspaceService {
    WorkspaceResponse createWorkspace(WorkspaceRequest workspaceRequest);
    WorkspaceResponse getWorkspaceById(Long workspaceId);
    WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceUpdateRequest workspaceUpdateRequest);
    void deleteWorkspace(Long workspaceId);
    WorkspaceMemberResponse inviteMember(Long workspaceId, WorkspaceMemberRequest request);
    void removeMember(Long workspaceId, Long userId);
    WorkspaceMemberResponse updateMemberRole(Long workspaceId, Long userId, WorkspaceRoleUpdateRequest request);
    List<WorkspaceMemberResponse> getWorkspaceMembers(Long workspaceId);
}