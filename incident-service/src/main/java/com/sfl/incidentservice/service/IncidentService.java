package com.sfl.incidentservice.service;

import com.sfl.incidentservice.dto.request.IncidentRequest;
import com.sfl.incidentservice.dto.response.IncidentResponse;
import com.sfl.incidentservice.entity.Incident;
import com.sfl.incidentservice.enums.IncidentStatus;
import com.sfl.incidentservice.exception.IncidentNotFoundException;
import com.sfl.incidentservice.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

    private final IncidentRepository incidentRepository;

    // Create Single Incident
    public IncidentResponse createIncident(IncidentRequest request) {

        log.info("Inside createIncident()");

        Incident incident = mapToEntity(request);

        incident.setStatus(IncidentStatus.REPORTED);
        incident.setReportedTime(LocalDateTime.now());

        Incident savedIncident = incidentRepository.save(incident);

        return mapToResponse(savedIncident);
    }

    // Create Multiple Incidents
    public List<IncidentResponse> createIncidents(List<IncidentRequest> requests) {

        log.info("Inside createIncidents()");

        List<Incident> incidents = requests.stream()
                .map(this::mapToEntity)
                .peek(incident -> {
                    incident.setStatus(IncidentStatus.REPORTED);
                    incident.setReportedTime(LocalDateTime.now());
                })
                .collect(Collectors.toList());

        List<Incident> savedIncidents = incidentRepository.saveAll(incidents);

        return savedIncidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get All
    public List<IncidentResponse> getAllIncidents() {

        return incidentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get By Id
    public IncidentResponse getIncidentById(Long id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new IncidentNotFoundException("Incident not found with id : " + id));

        return mapToResponse(incident);
    }

    // Update
    public IncidentResponse updateIncident(Long id, IncidentRequest request) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new IncidentNotFoundException("Incident not found with id : " + id));

        incident.setReporterName(request.getReporterName());
        incident.setMobile(request.getMobile());
        incident.setLocation(request.getLocation());
        incident.setDisasterType(request.getDisasterType());
        incident.setSeverity(request.getSeverity());
        incident.setDescription(request.getDescription());

        Incident updatedIncident = incidentRepository.save(incident);

        return mapToResponse(updatedIncident);
    }

    // Delete
    public String deleteIncident(Long id) {

        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new IncidentNotFoundException("Incident not found with id : " + id));

        incidentRepository.delete(incident);

        return "Incident deleted successfully.";
    }

    // Request DTO -> Entity
    private Incident mapToEntity(IncidentRequest request) {

        Incident incident = new Incident();

        incident.setReporterName(request.getReporterName());
        incident.setMobile(request.getMobile());
        incident.setLocation(request.getLocation());
        incident.setDisasterType(request.getDisasterType());
        incident.setSeverity(request.getSeverity());
        incident.setDescription(request.getDescription());

        return incident;
    }

    // Entity -> Response DTO
    private IncidentResponse mapToResponse(Incident incident) {

        return IncidentResponse.builder()
                .incidentId(incident.getIncidentId())
                .reporterName(incident.getReporterName())
                .mobile(incident.getMobile())
                .location(incident.getLocation())
                .disasterType(incident.getDisasterType())
                .severity(incident.getSeverity())
                .description(incident.getDescription())
                .status(incident.getStatus())
                .reportedTime(incident.getReportedTime())
                .build();
    }
}