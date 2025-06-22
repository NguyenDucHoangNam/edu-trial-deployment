package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.request.UniversityCreateRequest;
import com.fpt.edu_trial.dto.response.*;
import com.fpt.edu_trial.entity.Major;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor // Sử dụng @RequiredArgsConstructor để inject
@Component
public class UniversityMapper {

    private final ModelMapper modelMapper;
    private final FacultyMapper facultyMapper;
    private final ScholarshipProgramMapper scholarshipProgramMapper;
    private final TuitionProgramMapper tuitionProgramMapper;
    private final UniversityEventMapper universityEventMapper;
    private final UniversityFacilitiesMapper universityFacilitiesMapper;
    private final UniversityStudentLifeImageMapper universityStudentLifeImageMapper;
    private final TrialProgramMapper trialProgramMapper;


    public University toUniversity(UniversityCreateRequest request) {
        University university = modelMapper.map(request, University.class);
        return university;
    }

    public UniversityResponse toUniversityResponse(University university) {
        UniversityResponse response = modelMapper.map(university, UniversityResponse.class);
        if (university.getUser() != null) {
            response.setUserId(university.getUser().getId());
            response.setUserEmail(university.getUser().getEmail());
        }
        return response;
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) {
            return null;
        }
        UserProfileResponse profileResponse = modelMapper.map(user, UserProfileResponse.class);
        if (user.getRole() != null) {
            profileResponse.setRole(user.getRole().getName());
        }
        return profileResponse;
    }

    /**
     * SỬA ĐỔI: Đây là hàm bạn cần cập nhật.
     * Thêm tham số 'majorKeyword' và logic lọc danh sách ngành.
     */
    public UniversityFilterResponse toUniversityFilterResponse(University university, String majorKeyword) {
        if (university == null) {
            return null;
        }

        List<String> majorNames;
        if (university.getMajors() != null) {
            majorNames = university.getMajors().stream()
                    .map(Major::getName)
                    .filter(majorName -> !StringUtils.hasText(majorKeyword) || majorName.toLowerCase().contains(majorKeyword.toLowerCase()))
                    .collect(Collectors.toList());
        } else {
            majorNames = Collections.emptyList();
        }

        return UniversityFilterResponse.builder()
                .id(university.getId())
                .name(university.getName())
                .logoUrl(university.getLogoUrl()) // <-- THÊM DÒNG NÀY
                .address(university.getAddress())
                .introduction(university.getIntroduction())
                .majors(majorNames)
                .build();
    }

    // Hàm toUniversitySummaryResponse không liên quan đến lỗi này, giữ nguyên
    public UniversitySummaryResponse toUniversitySummaryResponse(University university) {
        if (university == null) {
            return null;
        }

        List<SimpleMajorResponse> majors = university.getMajors() != null
                ? university.getMajors().stream()
                .map(major -> SimpleMajorResponse.builder()
                        .id(major.getId())
                        .name(major.getName())
                        .build())
                .collect(Collectors.toList())
                : Collections.emptyList();


        return UniversitySummaryResponse.builder()
                .id(university.getId())
                .name(university.getName())
                .shortName(university.getShortName())
                .active(university.getActive())
                .address(university.getAddress())
                .introduction(university.getIntroduction())
                .majors(majors)
                .build();
    }

    public UniversityDetailResponse toUniversityDetailResponse(University university) {
        if (university == null) return null;

        // Map các trường cơ bản của University
        UniversityDetailResponse response = modelMapper.map(university, UniversityDetailResponse.class);

        // Map các danh sách liên quan bằng cách sử dụng các mapper tương ứng
        if (university.getFaculties() != null) {
            response.setFaculties(university.getFaculties().stream()
                    .map(facultyMapper::toFacultyResponse).collect(Collectors.toList()));
        }
        if (university.getScholarshipPrograms() != null) {
            response.setScholarshipPrograms(university.getScholarshipPrograms().stream()
                    .map(scholarshipProgramMapper::toScholarshipProgramResponse).collect(Collectors.toList()));
        }
        if (university.getTuitionPrograms() != null) {
            response.setTuitionPrograms(university.getTuitionPrograms().stream()
                    .map(tuitionProgramMapper::toTuitionProgramResponse).collect(Collectors.toList()));
        }
        if (university.getUniversityEvents() != null) {
            response.setUniversityEvents(university.getUniversityEvents().stream()
                    .map(universityEventMapper::toUniversityEventResponse).collect(Collectors.toList()));
        }
        if (university.getUniversityFacilities() != null) {
            response.setUniversityFacilities(university.getUniversityFacilities().stream()
                    .map(universityFacilitiesMapper::toUniversityFacilitiesResponse).collect(Collectors.toList()));
        }
        if (university.getUniversityStudentLifeImages() != null) {
            response.setUniversityStudentLifeImages(university.getUniversityStudentLifeImages().stream()
                    .map(universityStudentLifeImageMapper::toUniversityStudentLifeImageResponse).collect(Collectors.toList()));
        }
        if (university.getTrialPrograms() != null) {
            response.setTrialPrograms(university.getTrialPrograms().stream()
                    .map(trialProgramMapper::toTrialProgramResponse).collect(Collectors.toSet()));
        }
        return response;
    }
}