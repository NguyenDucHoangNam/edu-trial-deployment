package com.fpt.edu_trial.service;


import com.fpt.edu_trial.dto.request.ScholarshipProgramCreateRequest;
import com.fpt.edu_trial.dto.request.ScholarshipProgramUpdateRequest;
import com.fpt.edu_trial.dto.response.ScholarshipProgramResponse;
import com.fpt.edu_trial.entity.ScholarshipPrograms;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.ScholarshipProgramMapper;
import com.fpt.edu_trial.repository.ScholarshipProgramRepository;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScholarshipProgramService {

    private final ScholarshipProgramRepository scholarshipProgramRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final ScholarshipProgramMapper scholarshipProgramMapper;

    @Transactional
    public ScholarshipProgramResponse createScholarshipProgram(ScholarshipProgramCreateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to create scholarship program '{}' by user: {}", request.getName(), userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        // Optional: Kiểm tra tên chương trình học bổng đã tồn tại trong trường này chưa
        // scholarshipProgramRepository.findByNameAndUniversityId(request.getName(), managedUniversity.getId()).ifPresent(sp -> {
        //     throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Chương trình học bổng với tên này đã tồn tại cho trường của bạn.");
        // });

        ScholarshipPrograms program = scholarshipProgramMapper.toScholarshipProgram(request);
        program.setUniversity(managedUniversity);

        ScholarshipPrograms savedProgram = scholarshipProgramRepository.save(program);
        log.info("Scholarship program created successfully with ID: {} for university ID: {}", savedProgram.getId(), managedUniversity.getId());
        return scholarshipProgramMapper.toScholarshipProgramResponse(savedProgram);
    }

    @Transactional
    public ScholarshipProgramResponse updateScholarshipProgram(Long programId, ScholarshipProgramUpdateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to update scholarship program ID: {} by user: {}", programId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ScholarshipPrograms programToUpdate = scholarshipProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học bổng với ID: " + programId));

        // Kiểm tra chương trình có thuộc trường của người dùng không
        if (!programToUpdate.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to update scholarship program ID {} not belonging to their university.", userEmailFromToken, programId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền cập nhật chương trình học bổng này.");
        }

        boolean isModified = false;
        if (StringUtils.hasText(request.getName()) && !request.getName().equals(programToUpdate.getName())) {
            // Optional: Kiểm tra tên mới có trùng với chương trình khác của trường không
            // scholarshipProgramRepository.findByNameAndUniversityId(request.getName(), programToUpdate.getUniversity().getId()).ifPresent(sp -> {
            //     if (!sp.getId().equals(programId)) {
            //         throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Tên chương trình học bổng mới đã tồn tại cho trường của bạn.");
            //     }
            // });
            programToUpdate.setName(request.getName());
            isModified = true;
        }
        if (StringUtils.hasText(request.getCriteriaDescription()) && !request.getCriteriaDescription().equals(programToUpdate.getCriteriaDescription())) {
            programToUpdate.setCriteriaDescription(request.getCriteriaDescription());
            isModified = true;
        }
        if (StringUtils.hasText(request.getValueDescription()) && !request.getValueDescription().equals(programToUpdate.getValueDescription())) {
            programToUpdate.setValueDescription(request.getValueDescription());
            isModified = true;
        }

        if (isModified) {
            ScholarshipPrograms updatedProgram = scholarshipProgramRepository.save(programToUpdate);
            log.info("Scholarship program ID: {} updated successfully.", programId);
            return scholarshipProgramMapper.toScholarshipProgramResponse(updatedProgram);
        } else {
            log.info("No changes detected for scholarship program ID: {}.", programId);
            return scholarshipProgramMapper.toScholarshipProgramResponse(programToUpdate);
        }
    }

    @Transactional
    public void deleteScholarshipProgram(Long programId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to delete scholarship program ID: {} by user: {}", programId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ScholarshipPrograms programToDelete = scholarshipProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học bổng với ID: " + programId));

        if (!programToDelete.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete scholarship program ID {} not belonging to their university.", userEmailFromToken, programId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xóa chương trình học bổng này.");
        }

        scholarshipProgramRepository.delete(programToDelete);
        log.info("Scholarship program ID: {} deleted successfully.", programId);
    }

    @Transactional(readOnly = true)
    public Page<ScholarshipProgramResponse> getScholarshipProgramsByUniversity(Long universityId, Pageable pageable) {
        log.info("Fetching scholarship programs for university ID: {} with pagination: {}", universityId, pageable);
        // Không cần kiểm tra university tồn tại ở đây nếu API này là public và chỉ dựa vào universityId
        // Hoặc nếu là API của trường tự xem, universityId sẽ được lấy từ user đang login.
        return scholarshipProgramRepository.findByUniversityId(universityId, pageable)
                .map(scholarshipProgramMapper::toScholarshipProgramResponse);
    }

    @Transactional(readOnly = true)
    public Page<ScholarshipProgramResponse> getMyScholarshipPrograms(UserDetails authenticatedUserDetails, Pageable pageable) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        log.info("Fetching scholarship programs for current user's university ID: {} with pagination: {}", managedUniversity.getId(), pageable);
        return scholarshipProgramRepository.findByUniversityId(managedUniversity.getId(), pageable)
                .map(scholarshipProgramMapper::toScholarshipProgramResponse);
    }


    @Transactional(readOnly = true)
    public ScholarshipProgramResponse getScholarshipProgramByIdForUniversity(Long programId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        ScholarshipPrograms program = scholarshipProgramRepository.findByIdAndUniversityId(programId, managedUniversity.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học bổng với ID: " + programId + " cho trường của bạn."));
        return scholarshipProgramMapper.toScholarshipProgramResponse(program);
    }

    // Public API to get a scholarship program by its ID (no user context)
    @Transactional(readOnly = true)
    public ScholarshipProgramResponse getPublicScholarshipProgramById(Long programId) {
        ScholarshipPrograms program = scholarshipProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học bổng với ID: " + programId));
        return scholarshipProgramMapper.toScholarshipProgramResponse(program);
    }
}