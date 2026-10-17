package com.sfl.rescueteamservice.dto.response;

import com.sfl.rescueteamservice.enums.AvailabilityStatus;
import com.sfl.rescueteamservice.enums.TeamType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueTeamResponse {

    private Long teamId;
    private String teamName;
    private TeamType teamType;
    private String leaderName;
    private String contactNumber;
    private Integer teamSize;
    private AvailabilityStatus availabilityStatus;
    private String currentLocation;
    private LocalDateTime createdTime;
}