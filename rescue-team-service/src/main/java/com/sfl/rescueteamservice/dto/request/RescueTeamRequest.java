package com.sfl.rescueteamservice.dto.request;

import com.sfl.rescueteamservice.enums.TeamType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueTeamRequest {

    @NotBlank(message = "Team name is required")
    private String teamName;

    @NotNull(message = "Team type is required")
    private TeamType teamType;

    @NotBlank(message = "Leader name is required")
    private String leaderName;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;

    @NotNull(message = "Team size is required")
    @Min(value = 1, message = "Team size must be at least 1")
    private Integer teamSize;

    @NotBlank(message = "Current location is required")
    private String currentLocation;
}