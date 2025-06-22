package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.request.MajorCreateRequest;
import com.fpt.edu_trial.dto.response.MajorResponse;
import com.fpt.edu_trial.entity.Major;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor // Sử dụng Lombok để inject dependency
public class MajorMapper {

    private final ModelMapper modelMapper;

    /**
     * Chuyển từ Request DTO sang Entity.
     * Bỏ qua việc set faculty, vì sẽ được xử lý logic trong Service.
     */
    public Major toMajor(MajorCreateRequest request) {
        // ModelMapper sẽ tự động map các trường cùng tên (name, description)
        return modelMapper.map(request, Major.class);
    }

    /**
     * Chuyển từ Entity sang Response DTO.
     */
    public MajorResponse toMajorResponse(Major major) {
        // Map các trường cơ bản
        MajorResponse response = modelMapper.map(major, MajorResponse.class);

        // SỬA ĐỔI: Xử lý các trường quan hệ một cách an toàn
        if (major.getFaculty() != null) {
            response.setFacultyId(major.getFaculty().getId());
            response.setFacultyName(major.getFaculty().getName());
        }

        // Tên ngành giờ là String, không cần xử lý đặc biệt nữa
        // ModelMapper đã tự map trường `name`

        return response;
    }
}
