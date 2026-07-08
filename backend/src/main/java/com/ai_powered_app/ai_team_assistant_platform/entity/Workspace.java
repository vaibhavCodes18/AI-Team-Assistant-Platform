package com.ai_powered_app.ai_team_assistant_platform.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workspaces")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Workspace extends BaseEntity {
    @NotBlank(message = "Workspace name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Workspace slug is required")
    @Column(unique = true, nullable = false)
    private String slug;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private String logoUrl;

    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;


}
