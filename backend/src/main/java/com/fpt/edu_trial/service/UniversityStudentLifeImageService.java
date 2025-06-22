package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.UniversityStudentLifeImageCreateRequest;
import com.fpt.edu_trial.dto.request.UniversityStudentLifeImageUpdateRequest;
import com.fpt.edu_trial.dto.response.UniversityStudentLifeImageResponse;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.UniversityStudentLifeImages;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.UniversityStudentLifeImageMapper;
import com.fpt.edu_trial.repository.UniversityRepository;
import com.fpt.edu_trial.repository.UniversityStudentLifeImageRepository;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class UniversityStudentLifeImageService {

    private final UniversityStudentLifeImageRepository studentLifeImageRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final UniversityStudentLifeImageMapper studentLifeImageMapper;
    private final CloudinaryUploadService cloudinaryUploadService;

    @Transactional(readOnly = true)
    public Page<UniversityStudentLifeImageResponse> getMyStudentLifeImages(UserDetails authenticatedUserDetails, Pageable pageable) {
        String userEmail = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University university = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));

        log.info("Lấy danh sách ảnh Đời sống Sinh viên cho trường ID: {}", university.getId());
        return studentLifeImageRepository.findByUniversityId(university.getId(), pageable)
                .map(studentLifeImageMapper::toUniversityStudentLifeImageResponse);
    }

    // HÀM MỚI 2: Lấy chi tiết một ảnh của trường đang đăng nhập
    @Transactional(readOnly = true)
    public UniversityStudentLifeImageResponse getMyStudentLifeImageById(Long imageId, UserDetails authenticatedUserDetails) {
        String userEmail = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University university = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND));

        UniversityStudentLifeImages image = studentLifeImageRepository.findByIdAndUniversityId(imageId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ảnh với ID: " + imageId + " hoặc ảnh không thuộc về trường của bạn."));

        return studentLifeImageMapper.toUniversityStudentLifeImageResponse(image);
    }

    // HÀM MỚI 3: Lấy chi tiết một ảnh công khai bất kỳ
    @Transactional(readOnly = true)
    public UniversityStudentLifeImageResponse getPublicStudentLifeImageById(Long imageId) {
        log.info("Lấy thông tin ảnh Đời sống Sinh viên công khai với ID: {}", imageId);
        UniversityStudentLifeImages image = studentLifeImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ảnh với ID: " + imageId));
        return studentLifeImageMapper.toUniversityStudentLifeImageResponse(image);
    }

    @Transactional(readOnly = true)
    public Page<UniversityStudentLifeImageResponse> getPublicStudentLifeImagesByUniversity(Long universityId, Pageable pageable) {
        log.info("Lấy danh sách ảnh Đời sống Sinh viên công khai cho trường ID: {}", universityId);

        if (!universityRepository.existsById(universityId)) {
            throw new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Không tìm thấy trường đại học với ID: " + universityId);
        }

        return studentLifeImageRepository.findByUniversityId(universityId, pageable)
                .map(studentLifeImageMapper::toUniversityStudentLifeImageResponse);
    }
    @Transactional
    public UniversityStudentLifeImageResponse createStudentLifeImage(UniversityStudentLifeImageCreateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to create university student life image with name: '{}' by user: {}", request.getName(), userEmailFromToken);

        // 1. Lấy thông tin User từ email trong token
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng với email: " + userEmailFromToken));

        // 2. Lấy thông tin University mà User này quản lý
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        // 3. Upload hình ảnh lên Cloudinary (bắt buộc phải có ảnh)
        if (request.getImageFile() == null || request.getImageFile().isEmpty()) {
            throw new AppException(ErrorCode.MISSING_REQUEST_PART, "Ảnh cho đời sống sinh viên là bắt buộc.");
        }
        String folderName = "edu_trial/universities/" + managedUniversity.getId() + "/student_life_images";
        String imageUrl = cloudinaryUploadService.uploadFile(request.getImageFile(), folderName);
        if (imageUrl == null) {
            throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Không thể tải ảnh đời sống sinh viên lên.");
        }


        // 4. Map DTO sang Entity
        UniversityStudentLifeImages studentLifeImage = studentLifeImageMapper.toUniversityStudentLifeImage(request);
        studentLifeImage.setUniversity(managedUniversity);
        studentLifeImage.setImageUrl(imageUrl); // Gán URL ảnh đã upload

        // 5. Lưu vào database
        UniversityStudentLifeImages savedImage = studentLifeImageRepository.save(studentLifeImage);
        log.info("University student life image created successfully with ID: {} for university ID: {}", savedImage.getId(), managedUniversity.getId());

        // 6. Map Entity sang Response DTO và trả về
        return studentLifeImageMapper.toUniversityStudentLifeImageResponse(savedImage);
    }

    @Transactional
    public UniversityStudentLifeImageResponse updateStudentLifeImage(Long imageId,
                                                                     UniversityStudentLifeImageUpdateRequest request,
                                                                     UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to update student life image ID: {} by user: {}. Request name: '{}', Has new image: {}",
                imageId, userEmailFromToken, request.getName(), (request.getImageFile() != null && !request.getImageFile().isEmpty()));

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UniversityStudentLifeImages imageToUpdate = studentLifeImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ảnh đời sống sinh viên với ID: " + imageId));

        if (!imageToUpdate.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to update student life image ID {} not belonging to their university.", userEmailFromToken, imageId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền cập nhật ảnh này.");
        }

        boolean updated = false;

        // Cập nhật tên nếu được cung cấp
        if (StringUtils.hasText(request.getName())) {
            if (!request.getName().equals(imageToUpdate.getName())) {
                log.info("Updating name for image ID: {} from '{}' to '{}'", imageId, imageToUpdate.getName(), request.getName());
                imageToUpdate.setName(request.getName());
                updated = true;
            }
        }

        // Cập nhật ảnh nếu file mới được cung cấp
        MultipartFile newImageFile = request.getImageFile();
        if (newImageFile != null && !newImageFile.isEmpty()) {
            log.info("New image file provided for image ID: {}. Uploading new image.", imageId);
            // 1. Xóa ảnh cũ trên Cloudinary (nếu có)
            String oldImageUrl = imageToUpdate.getImageUrl();
            if (StringUtils.hasText(oldImageUrl)) {
                String oldPublicId = cloudinaryUploadService.extractPublicIdFromUrl(oldImageUrl);
                if (oldPublicId != null) {
                    log.info("Deleting old image from Cloudinary with public_id: {}", oldPublicId);
                    cloudinaryUploadService.deleteFileByPublicId(oldPublicId);
                } else {
                    log.warn("Could not extract public_id from old imageUrl: {} to delete from Cloudinary.", oldImageUrl);
                }
            }

            // 2. Upload ảnh mới
            String folderName = "edu_trial/universities/" + imageToUpdate.getUniversity().getId() + "/student_life_images";
            String newImageUrl = cloudinaryUploadService.uploadFile(newImageFile, folderName);
            if (newImageUrl == null) {
                throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Không thể tải ảnh mới lên.");
            }
            imageToUpdate.setImageUrl(newImageUrl);
            log.info("New image uploaded for image ID: {}. New URL: {}", imageId, newImageUrl);
            updated = true;
        }

        if (updated) {
            UniversityStudentLifeImages savedImage = studentLifeImageRepository.save(imageToUpdate);
            log.info("Student life image ID: {} updated successfully in DB.", imageId);
            return studentLifeImageMapper.toUniversityStudentLifeImageResponse(savedImage);
        } else {
            log.info("No changes detected for student life image ID: {}. Returning current state.", imageId);
            // Trả về trạng thái hiện tại nếu không có gì thay đổi
            return studentLifeImageMapper.toUniversityStudentLifeImageResponse(imageToUpdate);
        }
    }

    @Transactional
    public void deleteStudentLifeImage(Long imageId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to delete student life image ID: {} by user: {}", imageId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UniversityStudentLifeImages imageToDelete = studentLifeImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ảnh đời sống sinh viên với ID: " + imageId));

        if (!imageToDelete.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete student life image ID {} not belonging to their university.", userEmailFromToken, imageId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xóa ảnh này.");
        }

        String imageUrl = imageToDelete.getImageUrl();
        if (StringUtils.hasText(imageUrl)) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                boolean deletedFromCloudinary = cloudinaryUploadService.deleteFileByPublicId(publicId);
                if (!deletedFromCloudinary) {
                    log.warn("Failed to delete image from Cloudinary with public_id: {}. Corresponding DB record will still be deleted.", publicId);
                } else {
                    log.info("Successfully deleted image from Cloudinary with public_id: {}", publicId);
                }
            } else {
                log.warn("Could not extract public_id from imageUrl: {} to delete from Cloudinary.", imageUrl);
            }
        }

        studentLifeImageRepository.delete(imageToDelete);
        log.info("Student life image ID: {} deleted successfully from database.", imageId);
    }
}