package com.sfl.rescueteamservice.controller;

import com.sfl.rescueteamservice.dto.request.AvailabilityStatusRequest;
import com.sfl.rescueteamservice.dto.request.RescueTeamRequest;
import com.sfl.rescueteamservice.dto.response.RescueTeamResponse;
import com.sfl.rescueteamservice.service.RescueTeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rescue-teams")
@RequiredArgsConstructor
public class RescueTeamController {

    private final RescueTeamService rescueTeamService;

    // Create Single Rescue Team
    @PostMapping
    public RescueTeamResponse createRescueTeam(@Valid @RequestBody RescueTeamRequest request) {
        return rescueTeamService.createRescueTeam(request);
    }

    // Create Multiple Rescue Teams
    @PostMapping("/bulk")
    public List<RescueTeamResponse> createRescueTeams(@RequestBody List<RescueTeamRequest> requests) {
        return rescueTeamService.createRescueTeams(requests);
    }

    // Get All Rescue Teams
    @GetMapping
    public List<RescueTeamResponse> getAllRescueTeams() {
        return rescueTeamService.getAllRescueTeams();
    }

    // Get Rescue Team By ID
    @GetMapping("/{teamId}")
    public RescueTeamResponse getRescueTeamById(@PathVariable Long teamId) {
        return rescueTeamService.getRescueTeamById(teamId);
    }

    // Update Rescue Team
    @PutMapping("/{teamId}")
    public RescueTeamResponse updateRescueTeam(@PathVariable Long teamId,
                                               @Valid @RequestBody RescueTeamRequest request) {
        return rescueTeamService.updateRescueTeam(teamId, request);
    }

    // Delete Rescue Team
    @DeleteMapping("/{teamId}")
    public String deleteRescueTeam(@PathVariable Long teamId) {
        return rescueTeamService.deleteRescueTeam(teamId);
    }
    @PutMapping("/{teamId}/status")
    public RescueTeamResponse updateAvailabilityStatus(
            @PathVariable Long teamId,
            @RequestBody @Valid AvailabilityStatusRequest request) {

        return rescueTeamService.updateAvailabilityStatus(teamId, request);
    }
}