package com.sfl.alertservice.controller;

import com.sfl.alertservice.dto.request.AlertRequest;
import com.sfl.alertservice.dto.request.AlertStatusRequest;
import com.sfl.alertservice.dto.response.AlertResponse;
import com.sfl.alertservice.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    // Create Single Alert
    @PostMapping
    public AlertResponse createAlert(@Valid @RequestBody AlertRequest request) {
        return alertService.createAlert(request);
    }

    // Create Multiple Alerts
    @PostMapping("/bulk")
    public List<AlertResponse> createAlerts(@RequestBody List<AlertRequest> requests) {
        return alertService.createAlerts(requests);
    }

    // Get All Alerts
    @GetMapping
    public List<AlertResponse> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    // Get Alert By ID
    @GetMapping("/{alertId}")
    public AlertResponse getAlertById(@PathVariable Long alertId) {
        return alertService.getAlertById(alertId);
    }

    // Get Alerts By Mission ID
    @GetMapping("/mission/{missionId}")
    public List<AlertResponse> getAlertsByMissionId(@PathVariable Long missionId) {
        return alertService.getAlertsByMissionId(missionId);
    }

    // Update Alert
    @PutMapping("/{alertId}")
    public AlertResponse updateAlert(@PathVariable Long alertId,
                                     @Valid @RequestBody AlertRequest request) {

        return alertService.updateAlert(alertId, request);
    }

    // Update Alert Status
    @PatchMapping("/{alertId}/status")
    public AlertResponse updateAlertStatus(@PathVariable Long alertId,
                                           @Valid @RequestBody AlertStatusRequest request) {

        return alertService.updateAlertStatus(alertId, request);
    }

    // Delete Alert
    @DeleteMapping("/{alertId}")
    public String deleteAlert(@PathVariable Long alertId) {
        return alertService.deleteAlert(alertId);
    }
}