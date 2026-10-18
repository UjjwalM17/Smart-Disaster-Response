package com.sfl.incidentservice.dto.request;

import com.sfl.incidentservice.enums.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class IncidentRequest {

    @NotBlank(message = "Reporter name is required")
    private String reporterName;

    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Mobile number must be a valid 10-digit number"
    )
    private String mobile;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Disaster type is required")
    private String disasterType;

    @NotNull(message = "Severity is required")
    private Severity severity;

    @NotBlank(message = "Description is required")
    private String description;

    private Double latitude;

    private Double longitude;

    private String imageUrl;

    private Double priorityScore;

    private String aiLabel;

    private Double aiConfidence;

    private Boolean verified;

    private String clientIncidentId;

    private String duplicateGroupId;

    private Integer peopleAffected;

    private String notes;

    private String syncStatus;

}