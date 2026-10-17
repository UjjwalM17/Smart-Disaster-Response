package com.sfl.alertservice.dto.request;

import com.sfl.alertservice.enums.AlertSeverity;
import com.sfl.alertservice.enums.AlertType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertRequest {

    @NotNull(message = "Mission ID is required")
    private Long missionId;

    @NotNull(message = "Alert type is required")
    private AlertType alertType;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Severity is required")
    private AlertSeverity severity;
}