package com.fpt.edu_trial.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set; // Sử dụng Set để nhất quán với Entity

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityDetailResponse {
    // Thông tin cơ bản của trường
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

    // Danh sách các thông tin liên quan
    private List<FacultyResponse> faculties;
    private List<ScholarshipProgramResponse> scholarshipPrograms;
    private List<TuitionProgramResponse> tuitionPrograms;
    private List<UniversityEventResponse> universityEvents;
    private List<UniversityFacilitiesResponse> universityFacilities;
    private List<UniversityStudentLifeImageResponse> universityStudentLifeImages;
    private Set<TrialProgramResponse> trialPrograms;

}