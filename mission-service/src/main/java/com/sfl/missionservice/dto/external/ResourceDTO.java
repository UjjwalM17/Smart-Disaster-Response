package com.sfl.missionservice.dto.external;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ResourceDTO {

    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private Integer quantity;
    private String location;
    private String availabilityStatus;
    private LocalDateTime createdTime;

}