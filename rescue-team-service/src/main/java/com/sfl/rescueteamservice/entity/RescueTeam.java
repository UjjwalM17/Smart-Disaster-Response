package com.sfl.rescueteamservice.entity;

import com.sfl.rescueteamservice.enums.AvailabilityStatus;
import com.sfl.rescueteamservice.enums.TeamType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @Column(nullable = false)
    private String teamName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamType teamType;

    @Column(nullable = false)
    private String leaderName;

    @Column(nullable = false, unique = true)
    private String contactNumber;

    @Column(nullable = false)
    private Integer teamSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailabilityStatus availabilityStatus;

    @Column(nullable = false)
    private String currentLocation;

    @Column(nullable = false)
    private LocalDateTime createdTime;
}