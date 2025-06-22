package com.fpt.edu_trial.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityResponse {
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
    private Long userId;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
