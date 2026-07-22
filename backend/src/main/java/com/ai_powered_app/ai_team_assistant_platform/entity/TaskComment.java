package com.ai_powered_app.ai_team_assistant_platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "task_comments")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TaskComment extends BaseEntity {
    /**
     * Comment message.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Task to which this comment belongs.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    /**
     * User who wrote the comment.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;


}
