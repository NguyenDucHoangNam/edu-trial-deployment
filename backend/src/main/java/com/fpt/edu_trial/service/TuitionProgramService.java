package com.fpt.edu_trial.service;


import com.fpt.edu_trial.dto.request.TuitionProgramCreateRequest;
import com.fpt.edu_trial.dto.request.TuitionProgramUpdateRequest;
import com.fpt.edu_trial.dto.response.TuitionProgramResponse;
import com.fpt.edu_trial.entity.TuitionPrograms;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.TuitionProgramMapper;
import com.fpt.edu_trial.repository.TuitionProgramRepository;
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
public class TuitionProgramService {

    private final TuitionProgramRepository tuitionProgramRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final TuitionProgramMapper tuitionProgramMapper;

    @Transactional
    public TuitionProgramResponse createTuitionProgram(TuitionProgramCreateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to create tuition program '{}' by user: {}", request.getProgramName(), userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        // Optional: Kiểm tra tên chương trình đã tồn tại trong trường này chưa
        // tuitionProgramRepository.findByProgramNameAndUniversityId(request.getProgramName(), managedUniversity.getId()).ifPresent(tp -> {
        //     throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Chương trình học phí với tên này đã tồn tại cho trường của bạn.");
        // });

        TuitionPrograms program = tuitionProgramMapper.toTuitionProgram(request);
        program.setUniversity(managedUniversity);

        TuitionPrograms savedProgram = tuitionProgramRepository.save(program);
        log.info("Tuition program created successfully with ID: {} for university ID: {}", savedProgram.getId(), managedUniversity.getId());
        return tuitionProgramMapper.toTuitionProgramResponse(savedProgram);
    }

    @Transactional
    public TuitionProgramResponse updateTuitionProgram(Long programId, TuitionProgramUpdateRequest request, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to update tuition program ID: {} by user: {}", programId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        TuitionPrograms programToUpdate = tuitionProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học phí với ID: " + programId));

        if (!programToUpdate.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to update tuition program ID {} not belonging to their university.", userEmailFromToken, programId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền cập nhật chương trình học phí này.");
        }

        boolean isModified = false;
        if (StringUtils.hasText(request.getProgramName()) && !request.getProgramName().equals(programToUpdate.getProgramName())) {
            // Optional: Kiểm tra tên mới
            programToUpdate.setProgramName(request.getProgramName());
            isModified = true;
        }
        if (request.getFeeAmount() != null && request.getFeeAmount().compareTo(programToUpdate.getFeeAmount()) != 0) {
            programToUpdate.setFeeAmount(request.getFeeAmount());
            isModified = true;
        }
        if (request.getDescription() != null && (programToUpdate.getDescription() == null || !request.getDescription().equals(programToUpdate.getDescription()))) {
            programToUpdate.setDescription(request.getDescription());
            isModified = true;
        }

        if (isModified) {
            TuitionPrograms updatedProgram = tuitionProgramRepository.save(programToUpdate);
            log.info("Tuition program ID: {} updated successfully.", programId);
            return tuitionProgramMapper.toTuitionProgramResponse(updatedProgram);
        } else {
            log.info("No changes detected for tuition program ID: {}.", programId);
            return tuitionProgramMapper.toTuitionProgramResponse(programToUpdate);
        }
    }

    @Transactional
    public void deleteTuitionProgram(Long programId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        log.info("Attempting to delete tuition program ID: {} by user: {}", programId, userEmailFromToken);

        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        TuitionPrograms programToDelete = tuitionProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học phí với ID: " + programId));

        if (!programToDelete.getUniversity().getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete tuition program ID {} not belonging to their university.", userEmailFromToken, programId);
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xóa chương trình học phí này.");
        }

        tuitionProgramRepository.delete(programToDelete);
        log.info("Tuition program ID: {} deleted successfully.", programId);
    }

    @Transactional(readOnly = true)
    public Page<TuitionProgramResponse> getTuitionProgramsByUniversity(Long universityId, Pageable pageable) {
        log.info("Fetching tuition programs for university ID: {} with pagination: {}", universityId, pageable);
        return tuitionProgramRepository.findByUniversityId(universityId, pageable)
                .map(tuitionProgramMapper::toTuitionProgramResponse);
    }

    @Transactional(readOnly = true)
    public Page<TuitionProgramResponse> getMyTuitionPrograms(UserDetails authenticatedUserDetails, Pageable pageable) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        log.info("Fetching tuition programs for current user's university ID: {} with pagination: {}", managedUniversity.getId(), pageable);
        return tuitionProgramRepository.findByUniversityId(managedUniversity.getId(), pageable)
                .map(tuitionProgramMapper::toTuitionProgramResponse);
    }

    @Transactional(readOnly = true)
    public TuitionProgramResponse getTuitionProgramByIdForUniversity(Long programId, UserDetails authenticatedUserDetails) {
        String userEmailFromToken = authenticatedUserDetails.getUsername();
        User currentUser = userRepository.findByEmail(userEmailFromToken)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        University managedUniversity = universityRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Người dùng " + userEmailFromToken + " chưa được liên kết với trường đại học nào."));

        TuitionPrograms program = tuitionProgramRepository.findByIdAndUniversityId(programId, managedUniversity.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học phí với ID: " + programId + " cho trường của bạn."));
        return tuitionProgramMapper.toTuitionProgramResponse(program);
    }

    @Transactional(readOnly = true)
    public TuitionProgramResponse getPublicTuitionProgramById(Long programId) {
        TuitionPrograms program = tuitionProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học phí với ID: " + programId));
        return tuitionProgramMapper.toTuitionProgramResponse(program);
    }
}
