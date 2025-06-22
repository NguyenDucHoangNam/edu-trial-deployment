package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.FacultyCreateRequest;
import com.fpt.edu_trial.dto.request.FacultyUpdateRequest;
import com.fpt.edu_trial.dto.response.FacultyResponse;
import com.fpt.edu_trial.entity.Faculty;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.FacultyMapper;
import com.fpt.edu_trial.repository.FacultyRepository;
import com.fpt.edu_trial.repository.UniversityRepository;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final FacultyMapper facultyMapper;
    private final CloudinaryUploadService cloudinaryUploadService;
    private final ModelMapper modelMapper;

    private University getUniversityFromCurrentUser(UserDetails currentUserDetails) {
        User user = userRepository.findByEmail(currentUserDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return universityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND));
    }

    // Lấy danh sách khoa của trường mình
    @Transactional(readOnly = true)
    public Page<FacultyResponse> getMyFaculties(UserDetails currentUser, Pageable pageable) {
        University university = getUniversityFromCurrentUser(currentUser);
        return facultyRepository.findByUniversityId(university.getId(), pageable)
                .map(facultyMapper::toFacultyResponse);
    }

    // Tạo khoa mới cho trường mình
    @Transactional
    public FacultyResponse createFacultyForMyUniversity(FacultyCreateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);

        Faculty newFaculty = modelMapper.map(request, Faculty.class);
        newFaculty.setUniversity(university); // Gán trường sở hữu

        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            String imageUrl = cloudinaryUploadService.uploadFile(request.getImageFile(), "faculties");
            newFaculty.setImageUrl(imageUrl);
        }

        Faculty savedFaculty = facultyRepository.save(newFaculty);
        log.info("University '{}' created a new faculty '{}'", university.getName(), savedFaculty.getName());
        return facultyMapper.toFacultyResponse(savedFaculty);
    }

    // Cập nhật khoa của trường mình
    @Transactional
    public FacultyResponse updateMyFaculty(Long facultyId, FacultyUpdateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khoa với ID: " + facultyId));

        // Kiểm tra quyền sở hữu
        if (!faculty.getUniversity().getId().equals(university.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền chỉnh sửa khoa này.");
        }

        // Cập nhật các trường
        modelMapper.map(request, faculty); // Dùng ModelMapper để cập nhật các trường giống tên
        // Xử lý ảnh (nếu có)
        // ...

        Faculty updatedFaculty = facultyRepository.save(faculty);
        return facultyMapper.toFacultyResponse(updatedFaculty);
    }

    // Xóa khoa của trường mình
    @Transactional
    public void deleteMyFaculty(Long facultyId, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khoa với ID: " + facultyId));

        // Kiểm tra quyền sở hữu
        if (!faculty.getUniversity().getId().equals(university.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xóa khoa này.");
        }

        // Xóa ảnh trên Cloudinary nếu có
        if (StringUtils.hasText(faculty.getImageUrl())) {
            cloudinaryUploadService.deleteFileByPublicId(
                    cloudinaryUploadService.extractPublicIdFromUrl(faculty.getImageUrl())
            );
        }

        facultyRepository.delete(faculty);
        log.info("Faculty ID {} belonging to university '{}' has been deleted.", facultyId, university.getName());
    }
}