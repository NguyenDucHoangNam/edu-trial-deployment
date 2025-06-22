package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.response.UserProfileResponse;
import com.fpt.edu_trial.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ModelMapper modelMapper;

    public UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) {
            return null;
        }
        // Sử dụng ModelMapper để map các trường có cùng tên
        UserProfileResponse response = modelMapper.map(user, UserProfileResponse.class);

        // Map thủ công các trường cần xử lý đặc biệt
        if (user.getRole() != null) {
            response.setRole(user.getRole().getName());
        }

        return response;
    }
}