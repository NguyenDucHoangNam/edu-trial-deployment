package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.UniversityCreateRequest;
import com.fpt.edu_trial.dto.request.UpdateUniversityFacultiesRequest;
import com.fpt.edu_trial.dto.response.*;
import com.fpt.edu_trial.entity.Faculty;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.entity.Role;
import com.fpt.edu_trial.enums.PredefinedRole;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.UniversityMapper;
import com.fpt.edu_trial.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UniversityService {

    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UniversityMapper universityMapper;
    private final CloudinaryUploadService cloudinaryUploadService;
    private final ModelMapper modelMapper;
    private final FacultyRepository facultyRepository; // Thêm dependency này

    @Transactional(readOnly = true)
    public UniversityDetailResponse getUniversityDetail(Long universityId) {
        log.info("Lấy thông tin chi tiết cho trường đại học ID: {}", universityId);

        // Gọi phương thức repository mới để lấy dữ liệu hiệu quả
        University university = universityRepository.findDetailById(universityId)
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Không tìm thấy trường đại học với ID: " + universityId));

        // Dùng mapper mới để chuyển đổi
        return universityMapper.toUniversityDetailResponse(university);
    }
    @Transactional
    public UniversityResponse createUniversity(UniversityCreateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to create university with name: {} by user: {}", request.getName(), userEmailFromToken);

        User user = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng với email: " + userEmailFromToken + " từ token."));

        Role universityRole = roleRepository.findByName(PredefinedRole.UNIVERSITY.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED, "Vai trò " + PredefinedRole.UNIVERSITY.getRoleName() + " không tồn tại."));

        if (!user.getRole().getName().equals(PredefinedRole.UNIVERSITY.getRoleName())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Người dùng không có vai trò " + PredefinedRole.UNIVERSITY.getRoleName() + " để tạo trường đại học.");
        }

        if (universityRepository.findByUserId(user.getId()).isPresent()) {
            throw new AppException(ErrorCode.USER_ALREADY_LINKED_TO_UNIVERSITY, "Tài khoản của bạn đã được liên kết với một trường đại học khác.");
        }

        universityRepository.findByName(request.getName()).ifPresent(u -> {
            throw new AppException(ErrorCode.UNIVERSITY_NAME_ALREADY_EXISTS);
        });
        if (request.getShortName() != null && !request.getShortName().isEmpty()) {
            universityRepository.findByShortName(request.getShortName()).ifPresent(u -> {
                throw new AppException(ErrorCode.UNIVERSITY_SHORTNAME_ALREADY_EXISTS);
            });
        }

        String logoUrl = null;
        if (request.getLogoFile() != null && !request.getLogoFile().isEmpty()) {
            logoUrl = cloudinaryUploadService.uploadFile(request.getLogoFile(), "edu_trial/universities/logos");
        }

        String coverImageUrl = null;
        if (request.getCoverImageFile() != null && !request.getCoverImageFile().isEmpty()) {
            coverImageUrl = cloudinaryUploadService.uploadFile(request.getCoverImageFile(), "edu_trial/universities/cover_images");
        }

        University university = universityMapper.toUniversity(request);
        university.setUser(user);
        if (logoUrl != null) {
            university.setLogoUrl(logoUrl);
        }
        if (coverImageUrl != null) {
            university.setCoverImageUrl(coverImageUrl);
        }
        university.setEmail(request.getEmail());
        university.setPhone(request.getPhone());

        University savedUniversity = universityRepository.save(university);
        log.info("University created successfully with ID: {}", savedUniversity.getId());
        return universityMapper.toUniversityResponse(savedUniversity); // Create vẫn trả về UniversityResponse cơ bản
    }


    @Transactional(readOnly = true)
    public UniversityProfileResponse getUniversityProfileByIdentifier(String identifier) {
        log.info("Fetching university profile for identifier: {}", identifier);
        University university;
        try {
            Long id = Long.parseLong(identifier);
            university = universityRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Không tìm thấy trường đại học với ID: " + identifier));
        } catch (NumberFormatException e) {
            university = universityRepository.findByShortName(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Không tìm thấy trường đại học với tên viết tắt: " + identifier));
        }

        // Optional: Kiểm tra trường có active không nếu cần cho API public
        // if (university.getActive() == null || !university.getActive()) {
        //     throw new AppException(ErrorCode.UNIVERSITY_NOT_ACTIVE, "Trường đại học này không hoạt động.");
        // }

        return mapToUniversityProfileResponse(university);
    }

    @Transactional(readOnly = true)
    public UniversityProfileResponse getMyUniversityProfile(UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Fetching university profile for current user: {}", userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));

        return mapToUniversityProfileResponse(managedUniversity);
    }

    // Phương thức helper để map University sang UniversityProfileResponse
    private UniversityProfileResponse mapToUniversityProfileResponse(University university) {
        UniversityProfileResponse profileResponse = modelMapper.map(university, UniversityProfileResponse.class);
        if (university.getUser() != null) {
            profileResponse.setUniversityAccountInfo(universityMapper.toUserProfileResponse(university.getUser()));
        }
        return profileResponse;
    }

// Trong file UniversityService.java

// Trong file UniversityService.java

    @Transactional(readOnly = true)
    public Page<UniversityFilterResponse> filterPublicUniversities(String nameKeyword, String majorKeyword, Pageable pageable) {
        log.info("Bắt đầu lọc trường với từ khóa tên: '{}', từ khóa ngành: '{}'", nameKeyword, majorKeyword);

        // 1. Bắt đầu với một Specification rỗng, luôn đúng
        Specification<University> finalSpec = Specification.where(null);

        // 2. NẾU có từ khóa tên, DÙNG "AND" để nối điều kiện lọc tên vào
        if (StringUtils.hasText(nameKeyword)) {
            finalSpec = finalSpec.and(UniversitySpecification.byNameOrShortName(nameKeyword));
        }

        // 3. NẾU có từ khóa ngành, DÙNG "AND" để nối tiếp điều kiện lọc ngành vào
        if (StringUtils.hasText(majorKeyword)) {
            finalSpec = finalSpec.and(UniversitySpecification.byMajorName(majorKeyword));
        }

        // 4. Thực thi truy vấn với Specification cuối cùng đã được kết hợp
        Page<University> universitiesPage = universityRepository.findAll(finalSpec, pageable);

        // 5. Chuyển đổi kết quả và trả về
        return universitiesPage.map(university ->
                universityMapper.toUniversityFilterResponse(university, majorKeyword)
        );
    }

    @Transactional
    public UniversityProfileResponse upsertMyProfile(UniversityCreateRequest request, UserDetails currentUser) {
        // 1. Lấy thông tin người dùng đang đăng nhập
        String email = currentUser.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Logic Upsert: Tìm University theo userId.
        // - Nếu tìm thấy -> lấy ra để cập nhật.
        // - Nếu không tìm thấy -> tạo một đối tượng University mới và liên kết với user.
        University university = universityRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    log.info("Không tìm thấy profile cho user {}, tạo mới.", email);
                    University newUni = new University();
                    newUni.setUser(user);
                    return newUni;
                });

        // 3. Kiểm tra trùng lặp tên và tên viết tắt (phải loại trừ chính trường hiện tại nếu đang update)
        if (request.getName() != null) {
            universityRepository.findByName(request.getName()).ifPresent(existingUni -> {
                if (!existingUni.getId().equals(university.getId())) {
                    throw new AppException(ErrorCode.UNIVERSITY_NAME_ALREADY_EXISTS);
                }
            });
        }
        if (StringUtils.hasText(request.getShortName())) {
            universityRepository.findByShortName(request.getShortName()).ifPresent(existingUni -> {
                if (!existingUni.getId().equals(university.getId())) {
                    throw new AppException(ErrorCode.UNIVERSITY_SHORTNAME_ALREADY_EXISTS);
                }
            });
        }

        // 4. Cập nhật các trường thông tin từ request
        university.setName(request.getName());
        university.setShortName(request.getShortName());
        university.setEmail(request.getEmail());
        university.setPhone(request.getPhone());
        university.setWebsite(request.getWebsite());
        university.setAddress(request.getAddress());
        university.setSlogan(request.getSlogan());
        university.setIntroduction(request.getIntroduction());
        university.setHighlight(request.getHighlight());
        university.setVideoIntroUrl(request.getVideoIntroUrl());
        university.setGoogleMapEmbedUrl(request.getGoogleMapEmbedUrl());
        university.setActive(request.getActive() != null ? request.getActive() : true);


        // 5. Xử lý upload file logo
        if (request.getLogoFile() != null && !request.getLogoFile().isEmpty()) {
            // Xóa file cũ nếu có
            if (StringUtils.hasText(university.getLogoUrl())) {
                cloudinaryUploadService.deleteFileByPublicId(
                        cloudinaryUploadService.extractPublicIdFromUrl(university.getLogoUrl())
                );
            }
            // Tải file mới và cập nhật URL
            String logoUrl = cloudinaryUploadService.uploadFile(request.getLogoFile(), "edu_trial/universities/logos");
            university.setLogoUrl(logoUrl);
        }

        // 6. Xử lý upload file ảnh bìa
        if (request.getCoverImageFile() != null && !request.getCoverImageFile().isEmpty()) {
            if (StringUtils.hasText(university.getCoverImageUrl())) {
                cloudinaryUploadService.deleteFileByPublicId(
                        cloudinaryUploadService.extractPublicIdFromUrl(university.getCoverImageUrl())
                );
            }
            String coverImageUrl = cloudinaryUploadService.uploadFile(request.getCoverImageFile(), "edu_trial/universities/cover_images");
            university.setCoverImageUrl(coverImageUrl);
        }

        // 7. Lưu vào DB (JPA sẽ tự biết là INSERT hay UPDATE)
        University savedUniversity = universityRepository.save(university);
        log.info("Đã lưu (tạo mới/cập nhật) profile cho trường ID: {}", savedUniversity.getId());

        // 8. Map sang DTO và trả về
        return mapToUniversityProfileResponse(savedUniversity);
    }

    public UniversityProfileResponse updateMyUniversityFaculties(UpdateUniversityFacultiesRequest request, UserDetails currentUser) {
        String email = currentUser.getUsername();
        log.info("User {} updating faculties for their university.", email);

        University university = universityRepository.findByUserId(
                userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)).getId()
        ).orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND));

        List<Faculty> facultiesList = facultyRepository.findAllById(request.getFacultyIds());

        if (facultiesList.size() != request.getFacultyIds().size()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Một hoặc nhiều ID khoa không hợp lệ.");
        }

        // SỬA ĐỔI Ở ĐÂY: Chuyển đổi List thành Set trước khi gán
        university.setFaculties(new HashSet<>(facultiesList));

        University savedUniversity = universityRepository.save(university);

        return mapToUniversityProfileResponse(savedUniversity);
    }

}
