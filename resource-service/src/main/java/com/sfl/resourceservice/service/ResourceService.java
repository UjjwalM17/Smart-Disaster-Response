package com.sfl.resourceservice.service;

import com.sfl.resourceservice.dto.request.AvailabilityStatusRequest;
import com.sfl.resourceservice.dto.request.ResourceRequest;
import com.sfl.resourceservice.dto.response.ResourceResponse;
import com.sfl.resourceservice.entity.Resource;
import com.sfl.resourceservice.enums.AvailabilityStatus;
import com.sfl.resourceservice.exception.ResourceNotFoundException;
import com.sfl.resourceservice.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceResponse createResource(ResourceRequest request) {

        Resource resource = mapToEntity(request);
        resource.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        resource.setCreatedTime(LocalDateTime.now());

        return mapToResponse(resourceRepository.save(resource));
    }

    public List<ResourceResponse> createResources(List<ResourceRequest> requests) {

        List<Resource> resources = requests.stream()
                .map(this::mapToEntity)
                .peek(resource -> {
                    resource.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                    resource.setCreatedTime(LocalDateTime.now());
                })
                .toList();

        return resourceRepository.saveAll(resources)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ResourceResponse getResourceById(Long id) {

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with ID : " + id));

        return mapToResponse(resource);
    }

    public ResourceResponse updateResource(Long id, ResourceRequest request) {

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with ID : " + id));

        resource.setResourceName(request.getResourceName());
        resource.setResourceType(request.getResourceType());
        resource.setQuantity(request.getQuantity());
        resource.setLocation(request.getLocation());

        return mapToResponse(resourceRepository.save(resource));
    }
    public ResourceResponse updateAvailabilityStatus(
            Long resourceId,
            AvailabilityStatusRequest request) {

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Resource not found with ID : " + resourceId));

        resource.setAvailabilityStatus(request.getAvailabilityStatus());

        Resource updatedResource = resourceRepository.save(resource);

        return mapToResponse(updatedResource);
    }

    public String deleteResource(Long id) {

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with ID : " + id));

        resourceRepository.delete(resource);

        return "Resource deleted successfully.";
    }

    private Resource mapToEntity(ResourceRequest request) {

        return Resource.builder()
                .resourceName(request.getResourceName())
                .resourceType(request.getResourceType())
                .quantity(request.getQuantity())
                .location(request.getLocation())
                .build();
    }

    private ResourceResponse mapToResponse(Resource resource) {

        return ResourceResponse.builder()
                .resourceId(resource.getResourceId())
                .resourceName(resource.getResourceName())
                .resourceType(resource.getResourceType())
                .quantity(resource.getQuantity())
                .location(resource.getLocation())
                .availabilityStatus(resource.getAvailabilityStatus())
                .createdTime(resource.getCreatedTime())
                .build();
    }
}