package com.fpt.edu_trial.mapper;


import com.fpt.edu_trial.dto.request.UniversityFacilitiesCreateRequest;
import com.fpt.edu_trial.dto.response.UniversityFacilitiesResponse;
import com.fpt.edu_trial.entity.UniversityFacilities;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class UniversityFacilitiesMapper {

    private final ModelMapper modelMapper;

    public UniversityFacilitiesMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public UniversityFacilities toUniversityFacilities(UniversityFacilitiesCreateRequest request) {
        return modelMapper.map(request, UniversityFacilities.class);
    }

    public UniversityFacilitiesResponse toUniversityFacilitiesResponse(UniversityFacilities facility) {
        UniversityFacilitiesResponse response = modelMapper.map(facility, UniversityFacilitiesResponse.class);
        if (facility.getUniversity() != null) {
            response.setUniversityId(facility.getUniversity().getId());
            response.setUniversityName(facility.getUniversity().getName());
        }
        return response;
    }
}
