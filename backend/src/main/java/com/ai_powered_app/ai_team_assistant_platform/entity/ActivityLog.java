package com.ai_powered_app.ai_team_assistant_platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "activity_logs")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ActivityLog extends BaseEntity{
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String action;

    private String entityType;

    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String metadata;
    
}
