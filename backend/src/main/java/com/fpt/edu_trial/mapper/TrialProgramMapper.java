package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.response.TrialProgramFilterResponse;
import com.fpt.edu_trial.dto.response.TrialProgramResponse;
import com.fpt.edu_trial.entity.TrialProgram;
import com.fpt.edu_trial.entity.University;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TrialProgramMapper {

    private final ModelMapper modelMapper;

    public TrialProgramResponse toTrialProgramResponse(TrialProgram trialProgram) {
        TrialProgramResponse response = modelMapper.map(trialProgram, TrialProgramResponse.class);
        if (trialProgram.getUniversity() != null) {
            response.setUniversityId(trialProgram.getUniversity().getId());
            response.setUniversityName(trialProgram.getUniversity().getName());
        }
        return response;
    }

    public TrialProgramFilterResponse toTrialProgramFilterResponse(TrialProgram trialProgram) {
        // Map các trường cơ bản từ TrialProgram
        TrialProgramFilterResponse response = modelMapper.map(trialProgram, TrialProgramFilterResponse.class);

        // Lấy thông tin trường và map vào lớp con UniversityInfo
        University university = trialProgram.getUniversity();
        if (university != null) {
            TrialProgramFilterResponse.UniversityInfo universityInfo = new TrialProgramFilterResponse.UniversityInfo();
            universityInfo.setId(university.getId());
            universityInfo.setName(university.getName());
            universityInfo.setLogoUrl(university.getLogoUrl());
            response.setUniversity(universityInfo);
        }

        return response;
    }
}
