package com.fpt.edu_trial.mapper;


import com.fpt.edu_trial.dto.request.ScholarshipProgramCreateRequest;
import com.fpt.edu_trial.dto.response.ScholarshipProgramResponse;
import com.fpt.edu_trial.entity.ScholarshipPrograms;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ScholarshipProgramMapper {

    private final ModelMapper modelMapper;

    public ScholarshipProgramMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public ScholarshipPrograms toScholarshipProgram(ScholarshipProgramCreateRequest request) {
        // university sẽ được set trong service
        return modelMapper.map(request, ScholarshipPrograms.class);
    }

    public ScholarshipProgramResponse toScholarshipProgramResponse(ScholarshipPrograms program) {
        ScholarshipProgramResponse response = modelMapper.map(program, ScholarshipProgramResponse.class);
        if (program.getUniversity() != null) {
            response.setUniversityId(program.getUniversity().getId());
            response.setUniversityName(program.getUniversity().getName());
        }
        return response;
    }
}
