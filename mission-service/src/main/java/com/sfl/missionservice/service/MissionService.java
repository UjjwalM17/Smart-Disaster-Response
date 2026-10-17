package com.sfl.missionservice.service;

import com.sfl.missionservice.dto.external.IncidentDTO;
import com.sfl.missionservice.dto.external.RescueTeamDTO;
import com.sfl.missionservice.dto.external.ResourceDTO;
import com.sfl.missionservice.dto.request.*;
import com.sfl.missionservice.dto.response.MissionResponse;
import com.sfl.missionservice.entity.Mission;
import com.sfl.missionservice.enums.MissionStatus;
import com.sfl.missionservice.exception.MissionNotFoundException;
import com.sfl.missionservice.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionService {

    private final MissionRepository missionRepository;
    private final RestTemplate restTemplate;

    // ============================
    // CREATE SINGLE MISSION
    // ============================

    public MissionResponse createMission(MissionRequest request) {

        log.info("Inside createMission()");

        validateIncident(request.getIncidentId());
        validateRescueTeams(request.getRescueTeamIds());
        validateResources(request.getResourceIds());

        Mission mission = mapToEntity(request);

        mission.setStatus(MissionStatus.ASSIGNED);
        mission.setAssignedTime(LocalDateTime.now());

        Mission savedMission = missionRepository.save(mission);

        for (Long teamId : savedMission.getRescueTeamIds()) {
            updateRescueTeamStatus(teamId, "ON_MISSION");
        }

        for (Long resourceId : savedMission.getResourceIds()) {
            updateResourceStatus(resourceId, "IN_USE");
        }

        createAlert(savedMission.getMissionId());

        log.info("Mission Created Successfully with ID : {}", savedMission.getMissionId());

        return mapToResponse(savedMission);
    }

    // ============================
    // CREATE MULTIPLE MISSIONS
    // ============================

    public List<MissionResponse> createMissions(List<MissionRequest> requests) {

        log.info("Inside createMissions()");

        requests.forEach(request -> {
            validateIncident(request.getIncidentId());
            validateRescueTeams(request.getRescueTeamIds());
            validateResources(request.getResourceIds());
        });

        List<Mission> missions = requests.stream()
                .map(this::mapToEntity)
                .peek(mission -> {
                    mission.setStatus(MissionStatus.ASSIGNED);
                    mission.setAssignedTime(LocalDateTime.now());
                })
                .toList();

        List<Mission> savedMissions = missionRepository.saveAll(missions);

        return savedMissions.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================
    // VALIDATE INCIDENT
    // ============================

    private void validateIncident(Long incidentId) {

        String url = "http://localhost:8080/api/incidents/" + incidentId;

        try {
            IncidentDTO incident =
                    restTemplate.getForObject(url, IncidentDTO.class);
            log.info("Incident {} validated successfully.", incidentId);
        } catch (Exception ex) {
            throw new RuntimeException("Incident not found with ID : " + incidentId);
        }
    }

    // ============================
    // VALIDATE RESCUE TEAMS
    // ============================

    private void validateRescueTeams(List<Long> rescueTeamIds) {

        for (Long teamId : rescueTeamIds) {

            String url = "http://localhost:8081/api/rescue-teams/" + teamId;

            try {
                RescueTeamDTO team =
                        restTemplate.getForObject(url, RescueTeamDTO.class);
                log.info("Rescue Team {} validated successfully.", teamId);
            } catch (Exception ex) {
                throw new RuntimeException("Rescue Team not found with ID : " + teamId);
            }
        }
    }

    // ============================
    // VALIDATE RESOURCES
    // ============================

    private void validateResources(List<Long> resourceIds) {

        for (Long resourceId : resourceIds) {

            String url = "http://localhost:8082/api/resources/" + resourceId;

            try {
                ResourceDTO resource =
                        restTemplate.getForObject(url, ResourceDTO.class);
                log.info("Resource {} validated successfully.", resourceId);
            } catch (Exception ex) {
                throw new RuntimeException("Resource not found with ID : " + resourceId);
            }
        }
    }
    // ============================
    // GET ALL MISSIONS
    // ============================

    public List<MissionResponse> getAllMissions() {

        log.info("Fetching all missions");

        return missionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ============================
    // GET MISSION BY ID
    // ============================

    public MissionResponse getMissionById(Long missionId) {

        log.info("Fetching mission with ID : {}", missionId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() ->
                        new MissionNotFoundException(
                                "Mission not found with ID : " + missionId));

        return mapToResponse(mission);
    }

    // ============================
    // UPDATE MISSION
    // ============================

    public MissionResponse updateMission(Long missionId,
                                         MissionRequest request) {

        log.info("Updating mission with ID : {}", missionId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() ->
                        new MissionNotFoundException(
                                "Mission not found with ID : " + missionId));

        validateIncident(request.getIncidentId());
        validateRescueTeams(request.getRescueTeamIds());
        validateResources(request.getResourceIds());

        mission.setIncidentId(request.getIncidentId());
        mission.setRescueTeamIds(request.getRescueTeamIds());
        mission.setResourceIds(request.getResourceIds());
        mission.setPriority(request.getPriority());
        mission.setRemarks(request.getRemarks());

        Mission updatedMission = missionRepository.save(mission);

        return mapToResponse(updatedMission);
    }

    // ============================
    // DELETE MISSION
    // ============================

    public String deleteMission(Long missionId) {

        log.info("Deleting mission {}", missionId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() ->
                        new MissionNotFoundException(
                                "Mission not found with ID : " + missionId));

        missionRepository.delete(mission);

        return "Mission deleted successfully.";
    }

    // ============================
    // UPDATE MISSION STATUS
    // ============================

    public MissionResponse updateMissionStatus(Long missionId,
                                               MissionStatusRequest request) {

        log.info("Updating mission status for {}", missionId);

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() ->
                        new MissionNotFoundException(
                                "Mission not found with ID : " + missionId));

        mission.setStatus(request.getStatus());

        if (request.getStatus() == MissionStatus.COMPLETED) {
            mission.setCompletedTime(LocalDateTime.now());
        }

        Mission updatedMission = missionRepository.save(mission);

        return mapToResponse(updatedMission);
    }

    // ============================
    // REQUEST DTO -> ENTITY
    // ============================

    private Mission mapToEntity(MissionRequest request) {

        return Mission.builder()
                .incidentId(request.getIncidentId())
                .rescueTeamIds(request.getRescueTeamIds())
                .resourceIds(request.getResourceIds())
                .priority(request.getPriority())
                .remarks(request.getRemarks())
                .build();
    }

    // ============================
    // ENTITY -> RESPONSE DTO
    // ============================

    private MissionResponse mapToResponse(Mission mission) {

        return MissionResponse.builder()
                .missionId(mission.getMissionId())
                .incidentId(mission.getIncidentId())
                .rescueTeamIds(mission.getRescueTeamIds())
                .resourceIds(mission.getResourceIds())
                .priority(mission.getPriority())
                .status(mission.getStatus())
                .assignedTime(mission.getAssignedTime())
                .completedTime(mission.getCompletedTime())
                .remarks(mission.getRemarks())
                .build();
    }
    private void updateResourceStatus(Long resourceId, String status) {

        ResourceAvailabilityStatusRequest request =
                new ResourceAvailabilityStatusRequest();

        request.setAvailabilityStatus(status);

        String url =
                "http://localhost:8082/api/resources/" + resourceId + "/status";

        restTemplate.put(url, request);
    }
    private void updateRescueTeamStatus(Long teamId, String status) {

        AvailabilityStatusRequest request = new AvailabilityStatusRequest();
        request.setAvailabilityStatus(status);

        String url =
                "http://localhost:8081/api/rescue-teams/" + teamId + "/status";

        restTemplate.put(url, request);
    }
    private void createAlert(Long missionId) {

        AlertRequest request = new AlertRequest();

        request.setMissionId(missionId);
        request.setAlertType("SMS");
        request.setSeverity("HIGH");
        request.setMessage("Mission " + missionId + " has been assigned successfully.");

        String url = "http://localhost:8085/api/alerts";

        restTemplate.postForObject(url, request, Object.class);
    }

}