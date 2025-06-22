package com.fpt.edu_trial.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversitySummaryResponse {
    private Long id;
    private String name;
    private String shortName;
    private Boolean active;
    private String address;
    private String introduction;
    private List<SimpleMajorResponse> majors;
}
