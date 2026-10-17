package com.sfl.resourceservice.controller;

import com.sfl.resourceservice.dto.request.AvailabilityStatusRequest;
import com.sfl.resourceservice.dto.request.ResourceRequest;
import com.sfl.resourceservice.dto.response.ResourceResponse;
import com.sfl.resourceservice.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // Create Single Resource
    @PostMapping
    public ResourceResponse createResource(@Valid @RequestBody ResourceRequest request) {
        return resourceService.createResource(request);
    }

    // Create Multiple Resources
    @PostMapping("/bulk")
    public List<ResourceResponse> createResources(@RequestBody List<ResourceRequest> requests) {
        return resourceService.createResources(requests);
    }

    // Get All Resources
    @GetMapping
    public List<ResourceResponse> getAllResources() {
        return resourceService.getAllResources();
    }

    // Get Resource By ID
    @GetMapping("/{resourceId}")
    public ResourceResponse getResourceById(@PathVariable Long resourceId) {
        return resourceService.getResourceById(resourceId);
    }

    // Update Resource
    @PutMapping("/{resourceId}")
    public ResourceResponse updateResource(@PathVariable Long resourceId,
                                           @Valid @RequestBody ResourceRequest request) {
        return resourceService.updateResource(resourceId, request);
    }
    @PutMapping("/{resourceId}/status")
    public ResourceResponse updateAvailabilityStatus(
            @PathVariable Long resourceId,
            @RequestBody @Valid AvailabilityStatusRequest request) {

        return resourceService.updateAvailabilityStatus(resourceId, request);
    }

    // Delete Resource
    @DeleteMapping("/{resourceId}")
    public String deleteResource(@PathVariable Long resourceId) {
        return resourceService.deleteResource(resourceId);
    }
}