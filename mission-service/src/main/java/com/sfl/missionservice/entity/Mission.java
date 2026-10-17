package com.sfl.missionservice.entity;

import com.sfl.missionservice.enums.MissionPriority;
import com.sfl.missionservice.enums.MissionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "missions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long missionId;

    @Column(nullable = false)
    private Long incidentId;

    @ElementCollection
    @CollectionTable(name = "mission_rescue_teams",
            joinColumns = @JoinColumn(name = "mission_id"))
    @Column(name = "rescue_team_id")
    private List<Long> rescueTeamIds;

    @ElementCollection
    @CollectionTable(name = "mission_resources",
            joinColumns = @JoinColumn(name = "mission_id"))
    @Column(name = "resource_id")
    private List<Long> resourceIds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionStatus status;

    @Column(nullable = false)
    private LocalDateTime assignedTime;

    private LocalDateTime completedTime;

    private String remarks;
}