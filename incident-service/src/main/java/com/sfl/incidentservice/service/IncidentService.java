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

        // Idempotency check for offline synchronization
        if (request.getClientIncidentId() != null && !request.getClientIncidentId().trim().isEmpty()) {
            java.util.Optional<Incident> existing = incidentRepository.findByClientIncidentId(request.getClientIncidentId().trim());
            if (existing.isPresent()) {
                log.info("Incident with clientIncidentId {} already exists. Returning existing record.", request.getClientIncidentId());
                return mapToResponse(existing.get());
            }
        }

        Incident incident = mapToEntity(request);

        // AI Autonomous Verification & Triage Logic
        if (request.getAiConfidence() != null && request.getAiConfidence() >= 70.0) {
            incident.setVerified(true);
            if (incident.getStatus() == null || incident.getStatus() == IncidentStatus.REPORTED) {
                incident.setStatus(IncidentStatus.IN_PROGRESS);
            }
            String autoNote = "[AI Auto-Verified: Confidence " + request.getAiConfidence() + "% >= 70%]";
            if (incident.getNotes() == null || !incident.getNotes().contains("AI Auto-Verified")) {
                incident.setNotes(incident.getNotes() != null && !incident.getNotes().trim().isEmpty()
                    ? incident.getNotes() + " | " + autoNote
                    : autoNote);
            }
        } else {
            incident.setVerified(false);
            if (incident.getStatus() == null) {
                incident.setStatus(IncidentStatus.REPORTED);
            }
            if (request.getAiConfidence() != null) {
                String flagNote = "[AI Flagged: Low Confidence (" + request.getAiConfidence() + "%) - Uncertain Prediction]";
                if (incident.getNotes() == null || !incident.getNotes().contains("AI Flagged")) {
                    incident.setNotes(incident.getNotes() != null && !incident.getNotes().trim().isEmpty()
                        ? incident.getNotes() + " | " + flagNote
                        : flagNote);
                }
            }
        }

        if (incident.getReportedTime() == null) {
            incident.setReportedTime(LocalDateTime.now());
        }
        incident.setSyncStatus("SYNCED");

        Incident savedIncident = incidentRepository.save(incident);

        return mapToResponse(savedIncident);
    }

    // Create Multiple Incidents / Batch Sync
    public List<IncidentResponse> createIncidents(List<IncidentRequest> requests) {

        log.info("Inside createIncidents()");

        return requests.stream()
                .map(this::createIncident)
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
        if (request.getLatitude() != null) incident.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) incident.setLongitude(request.getLongitude());
        if (request.getImageUrl() != null) incident.setImageUrl(request.getImageUrl());
        if (request.getPriorityScore() != null) incident.setPriorityScore(request.getPriorityScore());
        if (request.getAiLabel() != null) incident.setAiLabel(request.getAiLabel());
        if (request.getAiConfidence() != null) incident.setAiConfidence(request.getAiConfidence());
        if (request.getVerified() != null) incident.setVerified(request.getVerified());
        if (request.getPeopleAffected() != null) incident.setPeopleAffected(request.getPeopleAffected());
        if (request.getNotes() != null) incident.setNotes(request.getNotes());
        if (request.getDuplicateGroupId() != null) incident.setDuplicateGroupId(request.getDuplicateGroupId());

        Incident updatedIncident = incidentRepository.save(incident);

        return mapToResponse(updatedIncident);
    }

    // Verify Incident (Admin override / confirm)
    public IncidentResponse verifyIncident(Long id, Boolean verified, String notes) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new IncidentNotFoundException("Incident not found with id : " + id));

        incident.setVerified(Boolean.TRUE.equals(verified));
        if (notes != null && !notes.trim().isEmpty()) {
            incident.setNotes(incident.getNotes() != null ? incident.getNotes() + " | Verification: " + notes : "Verification: " + notes);
        }
        if (Boolean.TRUE.equals(verified) && incident.getStatus() == IncidentStatus.REPORTED) {
            incident.setStatus(IncidentStatus.IN_PROGRESS);
        }
        Incident updatedIncident = incidentRepository.save(incident);
        return mapToResponse(updatedIncident);
    }

    // Update Status
    public IncidentResponse updateStatus(Long id, IncidentStatus status) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() ->
                        new IncidentNotFoundException("Incident not found with id : " + id));

        incident.setStatus(status);
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
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());
        incident.setImageUrl(request.getImageUrl());
        incident.setPriorityScore(request.getPriorityScore());
        incident.setAiLabel(request.getAiLabel());
        incident.setAiConfidence(request.getAiConfidence());
        boolean isVerified = (request.getAiConfidence() != null && request.getAiConfidence() >= 70.0)
                || Boolean.TRUE.equals(request.getVerified());
        incident.setVerified(isVerified);
        incident.setClientIncidentId(request.getClientIncidentId());
        incident.setDuplicateGroupId(request.getDuplicateGroupId());
        incident.setPeopleAffected(request.getPeopleAffected());
        incident.setNotes(request.getNotes());
        incident.setSyncStatus(request.getSyncStatus() != null ? request.getSyncStatus() : "SYNCED");

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
                .latitude(incident.getLatitude())
                .longitude(incident.getLongitude())
                .imageUrl(incident.getImageUrl())
                .priorityScore(incident.getPriorityScore())
                .aiLabel(incident.getAiLabel())
                .aiConfidence(incident.getAiConfidence())
                .verified(incident.getVerified())
                .clientIncidentId(incident.getClientIncidentId())
                .duplicateGroupId(incident.getDuplicateGroupId())
                .peopleAffected(incident.getPeopleAffected())
                .notes(incident.getNotes())
                .syncStatus(incident.getSyncStatus())
                .build();
    }
}