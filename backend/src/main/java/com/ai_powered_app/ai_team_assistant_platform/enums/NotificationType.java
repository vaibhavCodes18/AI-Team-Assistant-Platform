package com.ai_powered_app.ai_team_assistant_platform.enums;

public enum NotificationType {
    // ==========================
    // Workspace
    // ==========================
    WORKSPACE_CREATED,
    WORKSPACE_UPDATED,
    WORKSPACE_DELETED,

    MEMBER_INVITED,
    MEMBER_JOINED,
    MEMBER_REMOVED,
    MEMBER_ROLE_UPDATED,

    // ==========================
    // Project
    // ==========================
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_DELETED,
    PROJECT_MEMBER_UPDATED,

    // ==========================
    // Task
    // ==========================
    TASK_CREATED,
    TASK_ASSIGNED,
    TASK_REASSIGNED,
    TASK_UPDATED,
    TASK_STATUS_CHANGED,
    TASK_COMPLETED,
    TASK_DELETED,

    // ==========================
    // Ticket
    // ==========================
    TICKET_CREATED,
    TICKET_ASSIGNED,
    TICKET_UPDATED,
    TICKET_STATUS_CHANGED,
    TICKET_RESOLVED,
    TICKET_CLOSED,

    // ==========================
    // Document
    // ==========================
    DOCUMENT_UPLOADED,
    DOCUMENT_SUMMARY_READY,
    DOCUMENT_DELETED,

    // ==========================
    // AI
    // ==========================
    AI_SUMMARY_GENERATED,
    AI_DOCUMENTATION_GENERATED,

    // ==========================
    // Authentication
    // ==========================
    LOGIN_SUCCESS,
    PASSWORD_CHANGED,

    // ==========================
    // Admin
    // ==========================
    USER_BLOCKED,
    USER_UNBLOCKED
}
