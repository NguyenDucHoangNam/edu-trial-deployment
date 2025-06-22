package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.UniversityEventCreateRequest;
import com.fpt.edu_trial.dto.request.UniversityEventUpdateRequest;
import com.fpt.edu_trial.dto.response.UniversityEventResponse;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.UniversityEvent;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.UniversityEventMapper;
import com.fpt.edu_trial.repository.UniversityEventRepository;
import com.fpt.edu_trial.repository.UniversityRepository;
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
public class UniversityEventService {

    private final UniversityEventRepository universityEventRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final UniversityEventMapper universityEventMapper;
    private final CloudinaryUploadService cloudinaryUploadService;

    @Transactional
    public UniversityEventResponse createUniversityEvent(UniversityEventCreateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to create university event with title: '{}' by user: {}", request.getTitle(), userEmailFromToken);

        // 1. Lấy thông tin User từ email trong token
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng với email: " + userEmailFromToken));

        // 2. Lấy thông tin University mà User này quản lý
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        // 3. Upload hình ảnh sự kiện lên Cloudinary (nếu có)
        String imageUrl = null;
        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            String folderName = "edu_trial/universities/" + managedUniversity.getId() + "/events";
            imageUrl = cloudinaryUploadService.uploadFile(request.getImageFile(), folderName);
        }

        // 4. Map DTO sang Entity
        UniversityEvent event = universityEventMapper.toUniversityEvent(request);
        event.setUniversity(managedUniversity);
        if (imageUrl != null) {
            event.setImageUrl(imageUrl);
        }

        // 5. Lưu vào database
        UniversityEvent savedEvent = universityEventRepository.save(event);
        log.info("University event created successfully with ID: {} for university ID: {}", savedEvent.getId(), managedUniversity.getId());

        // 6. Map Entity sang Response DTO và trả về
        return universityEventMapper.toUniversityEventResponse(savedEvent);
    }

    @Transactional
    public UniversityEventResponse updateUniversityEvent(Long eventId,
                                                         UniversityEventUpdateRequest request,
                                                         UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to update university event ID: {} by user: {}", eventId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UniversityEvent eventToUpdate = universityEventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy sự kiện với ID: " + eventId));

        // Kiểm tra xem sự kiện có thuộc trường của người dùng đang đăng nhập không
        if (!eventToUpdate.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to update event ID {} not belonging to their university.", userEmailFromToken, eventId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền cập nhật sự kiện này.");
        }

        boolean isModified = false;

        // Cập nhật các trường nếu chúng được cung cấp và khác giá trị cũ
        if (StringUtils.hasText(request.getTitle()) && !request.getTitle().equals(eventToUpdate.getTitle())) {
            log.info("Updating title for event ID: {} from '{}' to '{}'", eventId, eventToUpdate.getTitle(), request.getTitle());
            eventToUpdate.setTitle(request.getTitle());
            isModified = true;
        }
        if (request.getDate() != null && !request.getDate().equals(eventToUpdate.getDate())) {
            log.info("Updating date for event ID: {} from '{}' to '{}'", eventId, eventToUpdate.getDate(), request.getDate());
            eventToUpdate.setDate(request.getDate());
            isModified = true;
        }
        if (request.getDescription() != null && !request.getDescription().equals(eventToUpdate.getDescription())) { // Cho phép description là rỗng
            log.info("Updating description for event ID: {}", eventId);
            eventToUpdate.setDescription(request.getDescription());
            isModified = true;
        }
        if (StringUtils.hasText(request.getLocation()) && !request.getLocation().equals(eventToUpdate.getLocation())) {
            log.info("Updating location for event ID: {} from '{}' to '{}'", eventId, eventToUpdate.getLocation(), request.getLocation());
            eventToUpdate.setLocation(request.getLocation());
            isModified = true;
        }
        if (request.getLink() != null && !request.getLink().equals(eventToUpdate.getLink())) { // Cho phép link là rỗng
            log.info("Updating link for event ID: {}", eventId);
            eventToUpdate.setLink(request.getLink());
            isModified = true;
        }

        // Xử lý cập nhật ảnh
        MultipartFile newImageFile = request.getImageFile();
        if (newImageFile != null && !newImageFile.isEmpty()) {
            log.info("New image file provided for event ID: {}. Uploading new image.", eventId);
            // 1. Xóa ảnh cũ trên Cloudinary (nếu có)
            String oldImageUrl = eventToUpdate.getImageUrl();
            if (StringUtils.hasText(oldImageUrl)) {
                String oldPublicId = cloudinaryUploadService.extractPublicIdFromUrl(oldImageUrl);
                if (oldPublicId != null) {
                    log.info("Deleting old event image from Cloudinary with public_id: {}", oldPublicId);
                    cloudinaryUploadService.deleteFileByPublicId(oldPublicId);
                } else {
                    log.warn("Could not extract public_id from old event imageUrl: {} to delete from Cloudinary.", oldImageUrl);
                }
            }

            // 2. Upload ảnh mới
            String folderName = "edu_trial/universities/" + eventToUpdate.getUniversity().getId() + "/events";
            String newImageUrl = cloudinaryUploadService.uploadFile(newImageFile, folderName);
            if (newImageUrl == null) {
                throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Không thể tải ảnh sự kiện mới lên.");
            }
            eventToUpdate.setImageUrl(newImageUrl);
            log.info("New event image uploaded for event ID: {}. New URL: {}", eventId, newImageUrl);
            isModified = true;
        }

        if (isModified) {
            UniversityEvent updatedEvent = universityEventRepository.save(eventToUpdate);
            log.info("University event ID: {} updated successfully in DB.", eventId);
            return universityEventMapper.toUniversityEventResponse(updatedEvent);
        } else {
            log.info("No changes detected for university event ID: {}. Returning current state.", eventId);
            return universityEventMapper.toUniversityEventResponse(eventToUpdate); // Trả về trạng thái hiện tại nếu không có gì thay đổi
        }
    }

    private University getUniversityFromCurrentUser(UserDetails currentUserDetails) {
        User user = userRepository.findByEmail(currentUserDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return universityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));
    }

    @Transactional
    public void deleteUniversityEvent(Long eventId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to delete university event ID: {} by user: {}", eventId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UniversityEvent eventToDelete = universityEventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy sự kiện với ID: " + eventId));

        // Kiểm tra xem sự kiện có thuộc trường của người dùng đang đăng nhập không
        if (!eventToDelete.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete event ID {} not belonging to their university.", userEmailFromToken, eventId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xóa sự kiện này.");
        }

        // Xóa ảnh từ Cloudinary trước khi xóa khỏi DB
        String imageUrl = eventToDelete.getImageUrl();
        if (StringUtils.hasText(imageUrl)) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                boolean deletedFromCloudinary = cloudinaryUploadService.deleteFileByPublicId(publicId);
                if (!deletedFromCloudinary) {
                    log.warn("Failed to delete event image from Cloudinary with public_id: {}. Corresponding DB record will still be deleted.", publicId);
                } else {
                    log.info("Successfully deleted event image from Cloudinary with public_id: {}", publicId);
                }
            } else {
                log.warn("Could not extract public_id from event imageUrl: {} to delete from Cloudinary.", imageUrl);
            }
        }

        universityEventRepository.delete(eventToDelete);
        log.info("University event ID: {} deleted successfully from database.", eventId);
    }

    @Transactional(readOnly = true)
    public Page<UniversityEventResponse> getMyEvents(UserDetails authenticatedUserDetails, Pageable pageable) {
        String userEmail = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University university = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));

        log.info("Lấy danh sách sự kiện cho trường ID: {} với phân trang: {}", university.getId(), pageable);
        return universityEventRepository.findByUniversityId(university.getId(), pageable)
                .map(universityEventMapper::toUniversityEventResponse);
    }

    // HÀM MỚI 2: Lấy chi tiết một sự kiện của trường đang đăng nhập
    @Transactional(readOnly = true)
    public UniversityEventResponse getMyEventById(Long eventId, UserDetails authenticatedUserDetails) {
        String userEmail = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University university = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND));

        UniversityEvent event = universityEventRepository.findByIdAndUniversityId(eventId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy sự kiện với ID: " + eventId + " hoặc sự kiện không thuộc về trường của bạn."));

        return universityEventMapper.toUniversityEventResponse(event);
    }

    // HÀM MỚI 3: Lấy danh sách sự kiện công khai của một trường bất kỳ
    @Transactional(readOnly = true)
    public Page<UniversityEventResponse> getPublicEventsByUniversity(Long universityId, Pageable pageable) {
        log.info("Lấy danh sách sự kiện công khai cho trường ID: {} với phân trang: {}", universityId, pageable);
        if (!universityRepository.existsById(universityId)) {
            throw new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Không tìm thấy trường đại học với ID: " + universityId);
        }
        return universityEventRepository.findByUniversityId(universityId, pageable)
                .map(universityEventMapper::toUniversityEventResponse);
    }

    // HÀM MỚI 4: Lấy chi tiết một sự kiện công khai bất kỳ
    @Transactional(readOnly = true)
    public UniversityEventResponse getPublicEventById(Long eventId) {
        log.info("Lấy thông tin sự kiện công khai với ID: {}", eventId);
        UniversityEvent event = universityEventRepository.findById(eventId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy sự kiện với ID: " + eventId));
        return universityEventMapper.toUniversityEventResponse(event);
    }
}
