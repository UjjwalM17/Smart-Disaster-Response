package com.sfl.alertservice.dto.response;

import com.sfl.alertservice.enums.AlertSeverity;
import com.sfl.alertservice.enums.AlertStatus;
import com.sfl.alertservice.enums.AlertType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertResponse {

    private Long alertId;

    private Long missionId;

    private AlertType alertType;

    private String message;

    private AlertSeverity severity;

    private AlertStatus status;

    private LocalDateTime createdTime;

    private LocalDateTime sentTime;
}