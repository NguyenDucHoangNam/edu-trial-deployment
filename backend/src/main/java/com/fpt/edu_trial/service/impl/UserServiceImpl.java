package com.fpt.edu_trial.service.impl;

import com.fpt.edu_trial.dto.request.UserProfileUpdateRequest;
import com.fpt.edu_trial.mapper.UserMapper;
import com.fpt.edu_trial.service.CloudinaryUploadService;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.fpt.edu_trial.dto.request.ChangePasswordRequest;
import com.fpt.edu_trial.dto.response.UserProfileResponse;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.repository.UserRepository;
import com.fpt.edu_trial.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final CloudinaryUploadService cloudinaryUploadService; // Đảm bảo đã inject

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED, "Người dùng chưa được xác thực để đổi mật khẩu.");
        }

        String currentUserEmail = authentication.getName();
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + currentUserEmail));

        // 1. Xác minh mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Nỗ lực đổi mật khẩu thất bại cho user {}: Sai mật khẩu hiện tại.", currentUserEmail);
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        // 2. Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp không
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            log.warn("Nỗ lực đổi mật khẩu thất bại cho user {}: Mật khẩu mới không khớp với xác nhận.", currentUserEmail);
            throw new AppException(ErrorCode.NEW_PASSWORD_MISMATCH);
        }

        // 3. (Tùy chọn) Kiểm tra mật khẩu mới có trùng với mật khẩu cũ không
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            log.warn("Nỗ lực đổi mật khẩu thất bại cho user {}: Mật khẩu mới trùng với mật khẩu cũ.", currentUserEmail);
            throw new AppException(ErrorCode.BAD_REQUEST, "Mật khẩu mới không được trùng với mật khẩu cũ."); // Bạn có thể tạo ErrorCode riêng
        }

        // 4. Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Người dùng {} đã đổi mật khẩu thành công.", currentUserEmail);
        // (Tùy chọn) Gửi email thông báo đổi mật khẩu thành công
    }

    @Override
    public UserProfileResponse getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng với email: " + email));

        return userMapper.toUserProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateCurrentUserProfile(UserProfileUpdateRequest request) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User userToUpdate = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        log.info("Bắt đầu cập nhật profile cho người dùng: {}", currentUserEmail);

        if (request.getAvatarFile() != null && !request.getAvatarFile().isEmpty()) {
            if (StringUtils.hasText(userToUpdate.getAvatar())) {
                String oldPublicId = cloudinaryUploadService.extractPublicIdFromUrl(userToUpdate.getAvatar());
                cloudinaryUploadService.deleteFileByPublicId(oldPublicId);
            }
            String newAvatarUrl = cloudinaryUploadService.uploadFile(request.getAvatarFile(), "edu_trial/users/avatars");
            userToUpdate.setAvatar(newAvatarUrl);
        }

        boolean nameChanged = false;
        if (StringUtils.hasText(request.getFirstName()) && !request.getFirstName().equals(userToUpdate.getFirstName())) {
            userToUpdate.setFirstName(request.getFirstName());
            nameChanged = true;
        }
        if (StringUtils.hasText(request.getLastName()) && !request.getLastName().equals(userToUpdate.getLastName())) {
            userToUpdate.setLastName(request.getLastName());
            nameChanged = true;
        }
        if (nameChanged) {
            userToUpdate.setName(userToUpdate.getFullName());
        }

        if (request.getGender() != null) userToUpdate.setGender(request.getGender());
        if (StringUtils.hasText(request.getPhone())) userToUpdate.setPhone(request.getPhone());
        if (request.getDob() != null) userToUpdate.setDob(request.getDob());
        if (StringUtils.hasText(request.getAddress())) userToUpdate.setAddress(request.getAddress());
        if (request.getDescription() != null) userToUpdate.setDescription(request.getDescription());
        if (StringUtils.hasText(request.getZipCode())) userToUpdate.setZipCode(request.getZipCode());

        User updatedUser = userRepository.save(userToUpdate);
        log.info("Đã cập nhật thành công thông tin cho người dùng: {}", currentUserEmail);

        return userMapper.toUserProfileResponse(updatedUser);
    }
}
