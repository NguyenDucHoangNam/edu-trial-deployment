package com.fpt.edu_trial.service;


import com.fpt.edu_trial.dto.request.UniversityFacilitiesCreateRequest;
import com.fpt.edu_trial.dto.request.UniversityFacilitiesUpdateRequest;
import com.fpt.edu_trial.dto.response.UniversityFacilitiesResponse;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.UniversityFacilities;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.UniversityFacilitiesMapper;
import com.fpt.edu_trial.repository.UniversityFacilitiesRepository;
import com.fpt.edu_trial.repository.UniversityRepository;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class UniversityFacilitiesService {

    private final UniversityFacilitiesRepository universityFacilitiesRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final UniversityFacilitiesMapper universityFacilitiesMapper;
    private final CloudinaryUploadService cloudinaryUploadService;
    private final ModelMapper modelMapper; // Bổ sung ModelMapper để cập nhật

    // Hàm helper để lấy University từ UserDetails
    private University getUniversityFromCurrentUser(UserDetails currentUserDetails) {
        User user = userRepository.findByEmail(currentUserDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return universityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));
    }
    @Transactional
    public UniversityFacilitiesResponse createUniversityFacility(UniversityFacilitiesCreateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to create university facility with name: '{}' by user: {}", request.getName(), userEmailFromToken);

        // 1. Lấy thông tin User từ email trong token
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng với email: " + userEmailFromToken));

        // 2. Lấy thông tin University mà User này quản lý
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        // 3. Upload hình ảnh cơ sở vật chất lên Cloudinary (bắt buộc phải có ảnh)
        if (request.getImageFile() == null || request.getImageFile().isEmpty()) {
            throw new AppException(ErrorCode.MISSING_REQUEST_PART, "Ảnh cho cơ sở vật chất là bắt buộc.");
        }
        String folderName = "edu_trial/universities/" + managedUniversity.getId() + "/facilities";
        String imageUrl = cloudinaryUploadService.uploadFile(request.getImageFile(), folderName);
        if (imageUrl == null) {
            throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Không thể tải ảnh cơ sở vật chất lên.");
        }


        // 4. Map DTO sang Entity
        UniversityFacilities facility = universityFacilitiesMapper.toUniversityFacilities(request);
        facility.setUniversity(managedUniversity);
        facility.setImageUrl(imageUrl); // Gán URL ảnh đã upload

        // 5. Lưu vào database
        UniversityFacilities savedFacility = universityFacilitiesRepository.save(facility);
        log.info("University facility created successfully with ID: {} for university ID: {}", savedFacility.getId(), managedUniversity.getId());

        // 6. Map Entity sang Response DTO và trả về
        return universityFacilitiesMapper.toUniversityFacilitiesResponse(savedFacility);
    }
    @Transactional
    public UniversityFacilitiesResponse updateUniversityFacility(Long facilityId,
                                                                 UniversityFacilitiesUpdateRequest request,
                                                                 UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to update university facility ID: {} by user: {}. Request name: '{}', Has new image: {}",
                facilityId, userEmailFromToken, request.getName(), (request.getImageFile() != null && !request.getImageFile().isEmpty()));

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UniversityFacilities facilityToUpdate = universityFacilitiesRepository.findById(facilityId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy cơ sở vật chất với ID: " + facilityId));

        // Kiểm tra xem cơ sở vật chất có thuộc trường của người dùng đang đăng nhập không
        if (!facilityToUpdate.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to update facility ID {} not belonging to their university.", userEmailFromToken, facilityId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền cập nhật cơ sở vật chất này.");
        }

        boolean isModified = false;

        // Cập nhật tên nếu được cung cấp và khác giá trị cũ
        if (StringUtils.hasText(request.getName()) && !request.getName().equals(facilityToUpdate.getName())) {
            log.info("Updating name for facility ID: {} from '{}' to '{}'", facilityId, facilityToUpdate.getName(), request.getName());
            facilityToUpdate.setName(request.getName());
            isModified = true;
        }

        // Xử lý cập nhật ảnh
        MultipartFile newImageFile = request.getImageFile();
        if (newImageFile != null && !newImageFile.isEmpty()) {
            log.info("New image file provided for facility ID: {}. Uploading new image.", facilityId);
            // 1. Xóa ảnh cũ trên Cloudinary (nếu có)
            String oldImageUrl = facilityToUpdate.getImageUrl();
            if (StringUtils.hasText(oldImageUrl)) {
                String oldPublicId = cloudinaryUploadService.extractPublicIdFromUrl(oldImageUrl);
                if (oldPublicId != null) {
                    log.info("Deleting old facility image from Cloudinary with public_id: {}", oldPublicId);
                    cloudinaryUploadService.deleteFileByPublicId(oldPublicId);
                } else {
                    log.warn("Could not extract public_id from old facility imageUrl: {} to delete from Cloudinary.", oldImageUrl);
                }
            }

            // 2. Upload ảnh mới
            String folderName = "edu_trial/universities/" + facilityToUpdate.getUniversity().getId() + "/facilities";
            String newImageUrl = cloudinaryUploadService.uploadFile(newImageFile, folderName);
            if (newImageUrl == null) {
                throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Không thể tải ảnh cơ sở vật chất mới lên.");
            }
            facilityToUpdate.setImageUrl(newImageUrl);
            log.info("New facility image uploaded for facility ID: {}. New URL: {}", facilityId, newImageUrl);
            isModified = true;
        }

        if (isModified) {
            UniversityFacilities updatedFacility = universityFacilitiesRepository.save(facilityToUpdate);
            log.info("University facility ID: {} updated successfully in DB.", facilityId);
            return universityFacilitiesMapper.toUniversityFacilitiesResponse(updatedFacility);
        } else {
            log.info("No changes detected for university facility ID: {}. Returning current state.", facilityId);
            return universityFacilitiesMapper.toUniversityFacilitiesResponse(facilityToUpdate);
        }
    }

    @Transactional
    public void deleteUniversityFacility(Long facilityId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to delete university facility ID: {} by user: {}", facilityId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UniversityFacilities facilityToDelete = universityFacilitiesRepository.findById(facilityId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy cơ sở vật chất với ID: " + facilityId));

        // Kiểm tra xem cơ sở vật chất có thuộc trường của người dùng đang đăng nhập không
        if (!facilityToDelete.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete facility ID {} not belonging to their university.", userEmailFromToken, facilityId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xóa cơ sở vật chất này.");
        }

        // Xóa ảnh từ Cloudinary trước khi xóa khỏi DB
        String imageUrl = facilityToDelete.getImageUrl();
        if (StringUtils.hasText(imageUrl)) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                boolean deletedFromCloudinary = cloudinaryUploadService.deleteFileByPublicId(publicId);
                if (!deletedFromCloudinary) {
                    log.warn("Failed to delete facility image from Cloudinary with public_id: {}. Corresponding DB record will still be deleted.", publicId);
                } else {
                    log.info("Successfully deleted facility image from Cloudinary with public_id: {}", publicId);
                }
            } else {
                log.warn("Could not extract public_id from facility imageUrl: {} to delete from Cloudinary.", imageUrl);
            }
        }

        universityFacilitiesRepository.delete(facilityToDelete);
        log.info("University facility ID: {} deleted successfully from database.", facilityId);
    }
}