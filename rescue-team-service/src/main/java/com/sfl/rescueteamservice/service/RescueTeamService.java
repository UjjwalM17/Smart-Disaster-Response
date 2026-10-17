package com.sfl.rescueteamservice.service;

import com.sfl.rescueteamservice.dto.request.AvailabilityStatusRequest;
import com.sfl.rescueteamservice.dto.request.RescueTeamRequest;
import com.sfl.rescueteamservice.dto.response.RescueTeamResponse;
import com.sfl.rescueteamservice.entity.RescueTeam;
import com.sfl.rescueteamservice.enums.AvailabilityStatus;
import com.sfl.rescueteamservice.exception.RescueTeamNotFoundException;
import com.sfl.rescueteamservice.repository.RescueTeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueTeamService {

    private final RescueTeamRepository rescueTeamRepository;

    // Create Single Rescue Team
    public RescueTeamResponse createRescueTeam(RescueTeamRequest request) {

        log.info("Inside createRescueTeam()");

        RescueTeam rescueTeam = mapToEntity(request);
        rescueTeam.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        rescueTeam.setCreatedTime(LocalDateTime.now());

        RescueTeam savedRescueTeam = rescueTeamRepository.save(rescueTeam);

        log.info("Rescue Team created successfully with ID : {}", savedRescueTeam.getTeamId());

        return mapToResponse(savedRescueTeam);
    }

    // Create Multiple Rescue Teams
    public List<RescueTeamResponse> createRescueTeams(List<RescueTeamRequest> requests) {

        log.info("Inside createRescueTeams()");

        List<RescueTeam> rescueTeams = requests.stream()
                .map(this::mapToEntity)
                .peek(team -> {
                    team.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                    team.setCreatedTime(LocalDateTime.now());
                })
                .toList();

        List<RescueTeam> savedTeams = rescueTeamRepository.saveAll(rescueTeams);

        log.info("Total Rescue Teams Created : {}", savedTeams.size());

        return savedTeams.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get All Rescue Teams
    public List<RescueTeamResponse> getAllRescueTeams() {

        log.info("Fetching all Rescue Teams");

        return rescueTeamRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Get Rescue Team By ID
    public RescueTeamResponse getRescueTeamById(Long teamId) {

        log.info("Fetching Rescue Team with ID : {}", teamId);

        RescueTeam rescueTeam = rescueTeamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RescueTeamNotFoundException("Rescue Team not found with ID : " + teamId));

        return mapToResponse(rescueTeam);
    }

    // Update Rescue Team
    public RescueTeamResponse updateRescueTeam(Long teamId, RescueTeamRequest request) {

        log.info("Updating Rescue Team with ID : {}", teamId);

        RescueTeam rescueTeam = rescueTeamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RescueTeamNotFoundException("Rescue Team not found with ID : " + teamId));

        rescueTeam.setTeamName(request.getTeamName());
        rescueTeam.setTeamType(request.getTeamType());
        rescueTeam.setLeaderName(request.getLeaderName());
        rescueTeam.setContactNumber(request.getContactNumber());
        rescueTeam.setTeamSize(request.getTeamSize());
        rescueTeam.setCurrentLocation(request.getCurrentLocation());

        RescueTeam updatedTeam = rescueTeamRepository.save(rescueTeam);

        log.info("Rescue Team Updated Successfully");

        return mapToResponse(updatedTeam);
    }

    // Delete Rescue Team
    public String deleteRescueTeam(Long teamId) {

        log.info("Deleting Rescue Team with ID : {}", teamId);

        RescueTeam rescueTeam = rescueTeamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RescueTeamNotFoundException("Rescue Team not found with ID : " + teamId));

        rescueTeamRepository.delete(rescueTeam);

        log.info("Rescue Team Deleted Successfully");

        return "Rescue Team deleted successfully.";
    }

    // Request DTO -> Entity
    private RescueTeam mapToEntity(RescueTeamRequest request) {

        return RescueTeam.builder()
                .teamName(request.getTeamName())
                .teamType(request.getTeamType())
                .leaderName(request.getLeaderName())
                .contactNumber(request.getContactNumber())
                .teamSize(request.getTeamSize())
                .currentLocation(request.getCurrentLocation())
                .build();
    }

    // Entity -> Response DTO
    private RescueTeamResponse mapToResponse(RescueTeam rescueTeam) {

        return RescueTeamResponse.builder()
                .teamId(rescueTeam.getTeamId())
                .teamName(rescueTeam.getTeamName())
                .teamType(rescueTeam.getTeamType())
                .leaderName(rescueTeam.getLeaderName())
                .contactNumber(rescueTeam.getContactNumber())
                .teamSize(rescueTeam.getTeamSize())
                .availabilityStatus(rescueTeam.getAvailabilityStatus())
                .currentLocation(rescueTeam.getCurrentLocation())
                .createdTime(rescueTeam.getCreatedTime())
                .build();
    }
    public RescueTeamResponse updateAvailabilityStatus(
            Long teamId,
            AvailabilityStatusRequest request) {

        RescueTeam rescueTeam = rescueTeamRepository.findById(teamId)
                .orElseThrow(() ->
                        new RescueTeamNotFoundException(
                                "Rescue Team not found with ID : " + teamId));

        rescueTeam.setAvailabilityStatus(request.getAvailabilityStatus());

        RescueTeam updatedTeam = rescueTeamRepository.save(rescueTeam);

        return mapToResponse(updatedTeam);
    }
}