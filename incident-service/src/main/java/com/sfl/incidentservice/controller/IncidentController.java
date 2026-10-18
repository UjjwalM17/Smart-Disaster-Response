package com.sfl.incidentservice.controller;

import com.sfl.incidentservice.dto.request.IncidentRequest;
import com.sfl.incidentservice.dto.response.IncidentResponse;
import com.sfl.incidentservice.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Slf4j
public class IncidentController {

    private final IncidentService incidentService;

    // Create Single Incident
    @PostMapping
    public ResponseEntity<IncidentResponse> createIncident(
            @Valid @RequestBody IncidentRequest request) {

        log.info("Inside createIncident()");

        IncidentResponse response = incidentService.createIncident(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Create Multiple Incidents
    @PostMapping("/bulk")
    public ResponseEntity<List<IncidentResponse>> createIncidents(
            @Valid @RequestBody List<IncidentRequest> requests) {

        log.info("Inside createIncidents()");

        List<IncidentResponse> response = incidentService.createIncidents(requests);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Incidents
    @GetMapping
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {

        log.info("Inside getAllIncidents()");

        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    // Get Incident By ID
    @GetMapping("/{incidentId}")
    public ResponseEntity<IncidentResponse> getIncidentById(
            @PathVariable Long incidentId) {

        log.info("Inside getIncidentById()");

        return ResponseEntity.ok(incidentService.getIncidentById(incidentId));
    }

    // Update Incident
    @PutMapping("/{incidentId}")
    public ResponseEntity<IncidentResponse> updateIncident(
            @PathVariable Long incidentId,
            @Valid @RequestBody IncidentRequest request) {

        log.info("Inside updateIncident()");

        return ResponseEntity.ok(incidentService.updateIncident(incidentId, request));
    }

    // Verify Incident (Admin override / confirm)
    @PatchMapping("/{incidentId}/verify")
    public ResponseEntity<IncidentResponse> verifyIncident(
            @PathVariable Long incidentId,
            @RequestBody java.util.Map<String, Object> body) {

        log.info("Inside verifyIncident() for id: {}", incidentId);
        Boolean verified = body.containsKey("verified") ? Boolean.valueOf(body.get("verified").toString()) : true;
        String notes = body.containsKey("notes") ? (String) body.get("notes") : "";

        return ResponseEntity.ok(incidentService.verifyIncident(incidentId, verified, notes));
    }

    // Update Incident Status
    @PatchMapping("/{incidentId}/status")
    public ResponseEntity<IncidentResponse> updateStatus(
            @PathVariable Long incidentId,
            @RequestBody java.util.Map<String, String> body) {

        log.info("Inside updateStatus() for id: {}", incidentId);
        com.sfl.incidentservice.enums.IncidentStatus status = com.sfl.incidentservice.enums.IncidentStatus.valueOf(body.get("status"));

        return ResponseEntity.ok(incidentService.updateStatus(incidentId, status));
    }

    // Offline Batch Sync Endpoint with Idempotency
    @PostMapping("/sync")
    public ResponseEntity<List<IncidentResponse>> syncIncidents(
            @Valid @RequestBody List<IncidentRequest> requests) {

        log.info("Inside syncIncidents() processing {} batch records", requests.size());

        List<IncidentResponse> response = incidentService.createIncidents(requests);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Delete Incident
    @DeleteMapping("/{incidentId}")
    public ResponseEntity<String> deleteIncident(
            @PathVariable Long incidentId) {

        log.info("Inside deleteIncident()");

        return ResponseEntity.ok(incidentService.deleteIncident(incidentId));
    }
}