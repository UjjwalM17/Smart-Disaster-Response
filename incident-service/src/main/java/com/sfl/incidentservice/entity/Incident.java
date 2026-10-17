package com.sfl.incidentservice.entity;

import com.sfl.incidentservice.enums.IncidentStatus;
import com.sfl.incidentservice.enums.Severity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incidentId;

    @Column(nullable = false)
    private String reporterName;

    @Column(nullable = false, length = 10)
    private String mobile;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String disasterType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private IncidentStatus status;

    private LocalDateTime reportedTime;

}