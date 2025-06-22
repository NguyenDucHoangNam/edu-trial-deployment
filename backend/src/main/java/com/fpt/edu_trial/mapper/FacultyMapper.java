package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.response.FacultyResponse;
import com.fpt.edu_trial.entity.Faculty;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class FacultyMapper {
    private final ModelMapper modelMapper;
    private final MajorMapper majorMapper;

    public FacultyResponse toFacultyResponse(Faculty faculty) {
        FacultyResponse response = modelMapper.map(faculty, FacultyResponse.class);
        if (faculty.getUniversity() != null) {
            response.setUniversityId(faculty.getUniversity().getId());
        }

        if (faculty.getMajors() != null) {
            response.setMajors(
                    faculty.getMajors().stream()
                            .map(majorMapper::toMajorResponse)
                            .collect(Collectors.toList())
            );
        }
        return response;
    }
}