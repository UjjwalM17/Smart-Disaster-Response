package com.sfl.rescueteamservice.dto.request;

import com.sfl.rescueteamservice.enums.AvailabilityStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityStatusRequest {

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus availabilityStatus;

}