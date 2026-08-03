package com.ai_powered_app.ai_team_assistant_platform.auth_util.interfaces;

import com.ai_powered_app.ai_team_assistant_platform.entity.Project;
import com.ai_powered_app.ai_team_assistant_platform.entity.ProjectMember;
import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import com.ai_powered_app.ai_team_assistant_platform.entity.WorkspaceMember;

public interface AuthorizationService {

    User getAuthenticateUser();

//    checks is user is workspace owner, admin, project admin or not
    boolean isUserAuthorizedAdmin(WorkspaceMember workspaceMember, User currentUser, Project project,
                                  ProjectMember projectMember);
//    checks is user is workspace owner, admin, project admin or member
    boolean isUserAuthorizedMember(WorkspaceMember workspaceMember, User currentUser, Project project);
}
