package com.sfl.resourceservice.dto.request;

import com.sfl.resourceservice.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityStatusRequest {

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus availabilityStatus;

}