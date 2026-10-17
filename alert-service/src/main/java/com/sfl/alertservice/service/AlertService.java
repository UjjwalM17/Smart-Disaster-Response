package com.sfl.alertservice.service;

import com.sfl.alertservice.dto.request.AlertRequest;
import com.sfl.alertservice.dto.request.AlertStatusRequest;
import com.sfl.alertservice.dto.response.AlertResponse;
import com.sfl.alertservice.entity.Alert;
import com.sfl.alertservice.enums.AlertStatus;
import com.sfl.alertservice.exception.AlertNotFoundException;
import com.sfl.alertservice.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;

    // Create Single Alert
    public AlertResponse createAlert(AlertRequest request) {

        log.info("Inside createAlert()");

        Alert alert = mapToEntity(request);

        alert.setStatus(AlertStatus.PENDING);
        alert.setCreatedTime(LocalDateTime.now());

        Alert savedAlert = alertRepository.save(alert);

        log.info("Alert Created Successfully with ID : {}", savedAlert.getAlertId());

        return mapToResponse(savedAlert);
    }

    // Create Multiple Alerts
    public List<AlertResponse> createAlerts(List<AlertRequest> requests) {

        log.info("Inside createAlerts()");

        List<Alert> alerts = requests.stream()
                .map(this::mapToEntity)
                .peek(alert -> {
                    alert.setStatus(AlertStatus.PENDING);
                    alert.setCreatedTime(LocalDateTime.now());
                })
                .toList();

        List<Alert> savedAlerts = alertRepository.saveAll(alerts);

        return savedAlerts.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get All Alerts
    public List<AlertResponse> getAllAlerts() {

        return alertRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get Alert By ID
    public AlertResponse getAlertById(Long alertId) {

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() ->
                        new AlertNotFoundException("Alert not found with ID : " + alertId));

        return mapToResponse(alert);
    }

    // Get Alerts By Mission ID
    public List<AlertResponse> getAlertsByMissionId(Long missionId) {

        return alertRepository.findByMissionId(missionId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Update Alert
    public AlertResponse updateAlert(Long alertId, AlertRequest request) {

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() ->
                        new AlertNotFoundException("Alert not found with ID : " + alertId));

        alert.setMissionId(request.getMissionId());
        alert.setAlertType(request.getAlertType());
        alert.setMessage(request.getMessage());
        alert.setSeverity(request.getSeverity());

        Alert updatedAlert = alertRepository.save(alert);

        return mapToResponse(updatedAlert);
    }

    // Update Alert Status
    public AlertResponse updateAlertStatus(Long alertId,
                                           AlertStatusRequest request) {

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() ->
                        new AlertNotFoundException("Alert not found with ID : " + alertId));

        alert.setStatus(request.getStatus());

        if (request.getStatus() == AlertStatus.SENT) {
            alert.setSentTime(LocalDateTime.now());
        }

        Alert updatedAlert = alertRepository.save(alert);

        return mapToResponse(updatedAlert);
    }

    // Delete Alert
    public String deleteAlert(Long alertId) {

        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() ->
                        new AlertNotFoundException("Alert not found with ID : " + alertId));

        alertRepository.delete(alert);

        return "Alert deleted successfully.";
    }

    // Request DTO -> Entity
    private Alert mapToEntity(AlertRequest request) {

        return Alert.builder()
                .missionId(request.getMissionId())
                .alertType(request.getAlertType())
                .message(request.getMessage())
                .severity(request.getSeverity())
                .build();
    }

    // Entity -> Response DTO
    private AlertResponse mapToResponse(Alert alert) {

        return AlertResponse.builder()
                .alertId(alert.getAlertId())
                .missionId(alert.getMissionId())
                .alertType(alert.getAlertType())
                .message(alert.getMessage())
                .severity(alert.getSeverity())
                .status(alert.getStatus())
                .createdTime(alert.getCreatedTime())
                .sentTime(alert.getSentTime())
                .build();
    }

}