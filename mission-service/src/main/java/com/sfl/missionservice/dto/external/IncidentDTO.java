package com.sfl.missionservice.dto.external;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidentDTO {

    private Long incidentId;
    private String reporterName;
    private String mobile;
    private String location;
    private String disasterType;
    private String severity;
    private String description;
    private String status;
    private LocalDateTime reportedTime;

}