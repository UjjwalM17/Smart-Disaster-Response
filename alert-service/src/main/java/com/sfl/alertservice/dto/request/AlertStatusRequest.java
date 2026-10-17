package com.sfl.alertservice.dto.request;

import com.sfl.alertservice.enums.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertStatusRequest {

    @NotNull(message = "Alert status is required")
    private AlertStatus status;
}