package com.sfl.missionservice.dto.response;

import com.sfl.missionservice.enums.MissionPriority;
import com.sfl.missionservice.enums.MissionStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionResponse {

    private Long missionId;

    private Long incidentId;

    private List<Long> rescueTeamIds;

    private List<Long> resourceIds;

    private MissionPriority priority;

    private MissionStatus status;

    private LocalDateTime assignedTime;

    private LocalDateTime completedTime;

    private String remarks;
}