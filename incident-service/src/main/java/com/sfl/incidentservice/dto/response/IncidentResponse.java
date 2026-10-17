package com.sfl.incidentservice.dto.response;

import com.sfl.incidentservice.enums.IncidentStatus;
import com.sfl.incidentservice.enums.Severity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class IncidentResponse {

    private Long incidentId;

    private String reporterName;

    private String mobile;

    private String location;

    private String disasterType;

    private Severity severity;

    private String description;

    private IncidentStatus status;

    private LocalDateTime reportedTime;

}