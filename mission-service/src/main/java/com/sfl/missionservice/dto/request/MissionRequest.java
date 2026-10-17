package com.sfl.missionservice.dto.request;

import com.sfl.missionservice.enums.MissionPriority;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionRequest {

    @NotNull(message = "Incident ID is required")
    private Long incidentId;

    @NotEmpty(message = "At least one rescue team is required")
    private List<Long> rescueTeamIds;

    @NotEmpty(message = "At least one resource is required")
    private List<Long> resourceIds;

    @NotNull(message = "Mission priority is required")
    private MissionPriority priority;

    private String remarks;
}