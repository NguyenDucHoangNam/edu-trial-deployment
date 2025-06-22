package com.fpt.edu_trial.dto.response;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityProfileResponse {

    private Long id;
    private String name;
    private String shortName;
    private String logoUrl;
    private String coverImageUrl;
    private String email;
    private String phone;
    private String website;
    private String address;
    private String slogan;
    private String introduction;
    private String highlight;
    private String videoIntroUrl;
    private String googleMapEmbedUrl;
    private Boolean active;

    private UserProfileResponse universityAccountInfo;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
