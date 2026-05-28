package com.ai_powered_app.ai_team_assistant_platform.response;

public class ApiResponse<T> {
    private Integer status;
    private String msg;
    private T data;

    public ApiResponse() {
    }

    public ApiResponse(Integer status, String msg, T data) {
        this.status = status;
        this.msg = msg;
        this.data = data;
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

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
