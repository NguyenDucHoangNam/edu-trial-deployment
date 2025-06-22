package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.ChangePasswordRequest;
import com.fpt.edu_trial.dto.request.UserProfileUpdateRequest;
import com.fpt.edu_trial.dto.response.UserProfileResponse;

public interface UserService {
    void changePassword(ChangePasswordRequest request);
    UserProfileResponse getCurrentUserProfile();
    UserProfileResponse updateCurrentUserProfile(UserProfileUpdateRequest request);
}