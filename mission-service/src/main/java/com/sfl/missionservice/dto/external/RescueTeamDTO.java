package com.sfl.missionservice.dto.external;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RescueTeamDTO {

    private Long teamId;
    private String teamName;
    private String teamType;
    private String leaderName;
    private String contactNumber;
    private Integer teamSize;
    private String availabilityStatus;
    private String currentLocation;
    private LocalDateTime createdTime;

}