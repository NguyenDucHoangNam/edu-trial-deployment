package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.request.UniversityEventCreateRequest;
import com.fpt.edu_trial.dto.response.UniversityEventResponse;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.UniversityEvent;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class UniversityEventMapper {

    private final ModelMapper modelMapper;

    public UniversityEventMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public UniversityEvent toUniversityEvent(UniversityEventCreateRequest request) {
        return modelMapper.map(request, UniversityEvent.class);
    }

    public UniversityEventResponse toUniversityEventResponse(UniversityEvent event) {
        UniversityEventResponse response = modelMapper.map(event, UniversityEventResponse.class);
        if (event.getUniversity() != null) {
            response.setUniversityId(event.getUniversity().getId());
            response.setUniversityName(event.getUniversity().getName());
        }
        return response;
    }
}
