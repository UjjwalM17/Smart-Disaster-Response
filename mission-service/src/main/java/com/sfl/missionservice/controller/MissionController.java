package com.sfl.missionservice.controller;

import com.sfl.missionservice.dto.request.MissionRequest;
import com.sfl.missionservice.dto.request.MissionStatusRequest;
import com.sfl.missionservice.dto.response.MissionResponse;
import com.sfl.missionservice.service.MissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    // Create Single Mission
    @PostMapping
    public MissionResponse createMission(@Valid @RequestBody MissionRequest request) {
        return missionService.createMission(request);
    }

    // Create Multiple Missions
    @PostMapping("/bulk")
    public List<MissionResponse> createMissions(@RequestBody List<MissionRequest> requests) {
        return missionService.createMissions(requests);
    }

    // Get All Missions
    @GetMapping
    public List<MissionResponse> getAllMissions() {
        return missionService.getAllMissions();
    }

    // Get Mission By ID
    @GetMapping("/{missionId}")
    public MissionResponse getMissionById(@PathVariable Long missionId) {
        return missionService.getMissionById(missionId);
    }

    // Update Mission
    @PutMapping("/{missionId}")
    public MissionResponse updateMission(@PathVariable Long missionId,
                                         @Valid @RequestBody MissionRequest request) {
        return missionService.updateMission(missionId, request);
    }

    // Delete Mission
    @DeleteMapping("/{missionId}")
    public String deleteMission(@PathVariable Long missionId) {
        return missionService.deleteMission(missionId);
    }
    @PatchMapping("/{missionId}/status")
    public MissionResponse updateMissionStatus(
            @PathVariable Long missionId,
            @Valid @RequestBody MissionStatusRequest request) {

        return missionService.updateMissionStatus(missionId, request);
    }
}