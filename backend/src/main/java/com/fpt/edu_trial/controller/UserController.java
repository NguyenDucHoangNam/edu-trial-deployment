package com.fpt.edu_trial.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fpt.edu_trial.dto.request.ChangePasswordRequest;
import com.fpt.edu_trial.dto.request.UserProfileUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.UserProfileResponse;
import com.fpt.edu_trial.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    @PostMapping("/me/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        log.info("Yêu cầu đổi mật khẩu cho người dùng hiện tại.");
        userService.changePassword(changePasswordRequest);
        return ResponseEntity.ok(new ApiResponse(true, "Đổi mật khẩu thành công."));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        log.info("Yêu cầu lấy thông tin cá nhân của người dùng hiện tại.");
        UserProfileResponse userProfile = userService.getCurrentUserProfile();
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping(value = "/me/profile", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> updateCurrentUserProfile(
            @RequestParam("profileData") String profileDataJson,
            @RequestPart(value = "avatarFile", required = false) MultipartFile avatarFile) throws JsonProcessingException {

        log.info("Yêu cầu cập nhật profile cho người dùng hiện tại.");

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        UserProfileUpdateRequest request = objectMapper.readValue(profileDataJson, UserProfileUpdateRequest.class);

        if (avatarFile != null) {
            request.setAvatarFile(avatarFile);
        }

        UserProfileResponse updatedProfile = userService.updateCurrentUserProfile(request);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Cập nhật thông tin cá nhân thành công.")
                .data(updatedProfile)
                .build());
    }
}