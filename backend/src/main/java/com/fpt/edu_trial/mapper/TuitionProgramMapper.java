package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.request.TuitionProgramCreateRequest;
import com.fpt.edu_trial.dto.response.TuitionProgramResponse;
import com.fpt.edu_trial.entity.TuitionPrograms;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class TuitionProgramMapper {

    private final ModelMapper modelMapper;

    public TuitionProgramMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public TuitionPrograms toTuitionProgram(TuitionProgramCreateRequest request) {
        return modelMapper.map(request, TuitionPrograms.class);
    }

    public TuitionProgramResponse toTuitionProgramResponse(TuitionPrograms program) {
        TuitionProgramResponse response = modelMapper.map(program, TuitionProgramResponse.class);
        if (program.getUniversity() != null) {
            response.setUniversityId(program.getUniversity().getId());
            response.setUniversityName(program.getUniversity().getName());
        }
        return response;
    }
}