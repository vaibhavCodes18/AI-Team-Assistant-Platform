package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.dto.request.ProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectMemberRole;
import com.ai_powered_app.ai_team_assistant_platform.dto.request.UpdateProjectRequest;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectMemberResponse;
import com.ai_powered_app.ai_team_assistant_platform.dto.response.ProjectResponse;

import java.util.List;

public interface ProjectService {
     ProjectResponse createProject(ProjectRequest projectRequest);
     ProjectResponse getProjectById(Long projectId);
     List<ProjectMemberResponse> getProjectMembers(Long projectId);
     List<ProjectMemberResponse> inviteUserToProject(Long projectId, List<String> emails);
     void removeMemberFromProject(Long projectId, Long userId);
     List<ProjectResponse> getWorkspaceProjects(Long workspaceId);
     ProjectMemberResponse changeProjectMemberRole(Long projectId, Long userId, UpdateProjectMemberRole updateProjectMemberRole);
     ProjectResponse updateProject(Long projectId, UpdateProjectRequest updateProjectRequest);
     void deleteProject(Long projectId);
}
