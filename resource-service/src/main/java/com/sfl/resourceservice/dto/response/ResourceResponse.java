package com.sfl.resourceservice.dto.response;

import com.sfl.resourceservice.enums.AvailabilityStatus;
import com.sfl.resourceservice.enums.ResourceType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponse {

    private Long resourceId;
    private String resourceName;
    private ResourceType resourceType;
    private Integer quantity;
    private String location;
    private AvailabilityStatus availabilityStatus;
    private LocalDateTime createdTime;
}