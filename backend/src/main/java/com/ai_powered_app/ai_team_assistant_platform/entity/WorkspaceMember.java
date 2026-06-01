package com.ai_powered_app.ai_team_assistant_platform.entity;

import com.ai_powered_app.ai_team_assistant_platform.enums.WorkspaceRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "workspace_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"workspace_id", "user_id"})
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WorkspaceMember extends BaseEntity{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private WorkspaceRole role;

    

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by")
    private User invitedBy;

    private LocalDateTime joinedAt;


}
