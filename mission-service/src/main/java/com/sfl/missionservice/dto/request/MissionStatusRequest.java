package com.sfl.missionservice.dto.request;

import com.sfl.missionservice.enums.MissionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionStatusRequest {

    @NotNull(message = "Mission status is required")
    private MissionStatus status;
}