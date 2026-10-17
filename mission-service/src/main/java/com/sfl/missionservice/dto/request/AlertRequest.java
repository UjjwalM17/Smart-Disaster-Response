package com.sfl.missionservice.dto.request;

import lombok.Data;

@Data
public class AlertRequest {

    private Long missionId;
    private String alertType;
    private String message;
    private String severity;

}