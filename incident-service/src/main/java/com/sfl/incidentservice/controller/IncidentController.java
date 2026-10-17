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

    // Delete Incident
    @DeleteMapping("/{incidentId}")
    public ResponseEntity<String> deleteIncident(
            @PathVariable Long incidentId) {

        log.info("Inside deleteIncident()");

        return ResponseEntity.ok(incidentService.deleteIncident(incidentId));
    }
}