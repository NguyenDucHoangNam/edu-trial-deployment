package com.fpt.edu_trial.mapper;


import com.fpt.edu_trial.dto.request.UniversityStudentLifeImageCreateRequest;
import com.fpt.edu_trial.dto.response.UniversityStudentLifeImageResponse;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.UniversityStudentLifeImages;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class UniversityStudentLifeImageMapper {

    private final ModelMapper modelMapper;

    public UniversityStudentLifeImageMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public UniversityStudentLifeImages toUniversityStudentLifeImage(UniversityStudentLifeImageCreateRequest request) {
        return modelMapper.map(request, UniversityStudentLifeImages.class);
    }

    public UniversityStudentLifeImageResponse toUniversityStudentLifeImageResponse(UniversityStudentLifeImages imageEntity) {
        UniversityStudentLifeImageResponse response = modelMapper.map(imageEntity, UniversityStudentLifeImageResponse.class);
        if (imageEntity.getUniversity() != null) {
            response.setUniversityId(imageEntity.getUniversity().getId());
            response.setUniversityName(imageEntity.getUniversity().getName());
        }
        return response;
    }
}

