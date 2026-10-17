package com.sfl.missionservice.dto.external;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AlertDTO {

    private Long alertId;
    private Long missionId;
    private String alertType;
    private String message;
    private String severity;
    private String status;
    private LocalDateTime createdTime;
    private LocalDateTime sentTime;

}