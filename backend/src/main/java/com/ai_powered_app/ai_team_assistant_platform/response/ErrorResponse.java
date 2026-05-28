package com.ai_powered_app.ai_team_assistant_platform.response;

import java.time.LocalDateTime;

public class ErrorResponse {
    private Integer status;
    private String msg;
    private LocalDateTime localDateTime;

    public ErrorResponse() {
    }

    public ErrorResponse(Integer status, String msg, LocalDateTime localDateTime) {
        this.status = status;
        this.msg = msg;
        this.localDateTime = localDateTime;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public LocalDateTime getLocalDateTime() {
        return localDateTime;
    }

    public void setLocalDateTime(LocalDateTime localDateTime) {
        this.localDateTime = localDateTime;
    }
}
