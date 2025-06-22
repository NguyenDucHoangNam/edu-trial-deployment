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
public class UniversityFilterResponse {
    private Long id;
    private String name;

    private String logoUrl;


    private String address;
    private String introduction;
    private List<String> majors; // Danh sách tên các ngành học
}