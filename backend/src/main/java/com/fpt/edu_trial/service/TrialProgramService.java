package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.TrialProgramCreateRequest;
import com.fpt.edu_trial.dto.request.TrialProgramUpdateRequest;
import com.fpt.edu_trial.dto.response.TrialProgramFilterResponse;
import com.fpt.edu_trial.dto.response.TrialProgramResponse;
import com.fpt.edu_trial.entity.TrialProgram;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.TrialProgramMapper;
import com.fpt.edu_trial.repository.TrialProgramRepository;
import com.fpt.edu_trial.repository.TrialProgramSpecification;
import com.fpt.edu_trial.repository.UniversityRepository;
import com.fpt.edu_trial.repository.UserRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class TrialProgramService {

    private final TrialProgramRepository trialProgramRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final TrialProgramMapper trialProgramMapper;
    private final CloudinaryUploadService cloudinaryUploadService;
    private final ModelMapper modelMapper;

    private University getUniversityFromCurrentUser(UserDetails currentUserDetails) {
        User user = userRepository.findByEmail(currentUserDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return universityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));
    }

    @Transactional
    public TrialProgramResponse createTrialProgram(TrialProgramCreateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        log.info("Trường '{}' đang tạo chương trình học thử mới với tên: '{}'", university.getName(), request.getName());

        TrialProgram trialProgram = modelMapper.map(request, TrialProgram.class);
        trialProgram.setUniversity(university);

        if (request.getCoverImageFile() != null && !request.getCoverImageFile().isEmpty()) {
            String folder = "edu_trial/trial_programs/" + university.getId();
            String imageUrl = cloudinaryUploadService.uploadFile(request.getCoverImageFile(), folder);
            trialProgram.setCoverImageUrl(imageUrl);
        }

        TrialProgram savedProgram = trialProgramRepository.save(trialProgram);
        return trialProgramMapper.toTrialProgramResponse(savedProgram);
    }

    @Transactional
    public TrialProgramResponse updateTrialProgram(Long programId, TrialProgramUpdateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        TrialProgram programToUpdate = trialProgramRepository.findByIdAndUniversityId(programId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học thử ID: " + programId + " hoặc bạn không có quyền chỉnh sửa."));

        boolean isModified = false;
        if (StringUtils.hasText(request.getName()) && !request.getName().equals(programToUpdate.getName())) {
            programToUpdate.setName(request.getName());
            isModified = true;
        }
        if (request.getDescription() != null && !request.getDescription().equals(programToUpdate.getDescription())) {
            programToUpdate.setDescription(request.getDescription());
            isModified = true;
        }

        if (request.getCoverImageFile() != null && !request.getCoverImageFile().isEmpty()) {
            deleteImageFromCloudinary(programToUpdate.getCoverImageUrl());
            String folder = "edu_trial/trial_programs/" + university.getId();
            String newImageUrl = cloudinaryUploadService.uploadFile(request.getCoverImageFile(), folder);
            programToUpdate.setCoverImageUrl(newImageUrl);
            isModified = true;
        } else if (Boolean.TRUE.equals(request.getRemoveCurrentImage())) {
            deleteImageFromCloudinary(programToUpdate.getCoverImageUrl());
            programToUpdate.setCoverImageUrl(null);
            isModified = true;
        }

        if (isModified) {
            TrialProgram updatedProgram = trialProgramRepository.save(programToUpdate);
            return trialProgramMapper.toTrialProgramResponse(updatedProgram);
        }
        return trialProgramMapper.toTrialProgramResponse(programToUpdate);
    }

    @Transactional
    public void deleteTrialProgram(Long programId, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        TrialProgram programToDelete = trialProgramRepository.findByIdAndUniversityId(programId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học thử ID: " + programId + " hoặc bạn không có quyền xóa."));

        deleteImageFromCloudinary(programToDelete.getCoverImageUrl());
        trialProgramRepository.delete(programToDelete);
        log.info("Đã xóa chương trình học thử ID: {}", programId);
    }

    @Transactional(readOnly = true)
    public Page<TrialProgramResponse> getMyTrialPrograms(UserDetails currentUser, Pageable pageable) {
        University university = getUniversityFromCurrentUser(currentUser);
        return trialProgramRepository.findByUniversityId(university.getId(), pageable)
                .map(trialProgramMapper::toTrialProgramResponse);
    }

    @Transactional(readOnly = true)
    public Page<TrialProgramResponse> getPublicTrialProgramsByUniversity(Long universityId, Pageable pageable) {
        if (!universityRepository.existsById(universityId)) {
            throw new AppException(ErrorCode.UNIVERSITY_NOT_FOUND);
        }
        return trialProgramRepository.findByUniversityId(universityId, pageable)
                .map(trialProgramMapper::toTrialProgramResponse);
    }

    @Transactional(readOnly = true)
    public TrialProgramResponse getTrialProgramById(Long programId) {
        TrialProgram trialProgram = trialProgramRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy chương trình học thử ID: " + programId));
        return trialProgramMapper.toTrialProgramResponse(trialProgram);
    }

    private void deleteImageFromCloudinary(String imageUrl) {
        if (StringUtils.hasText(imageUrl)) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(imageUrl);
            cloudinaryUploadService.deleteFileByPublicId(publicId);
        }
    }

    @Transactional(readOnly = true)
    public Page<TrialProgramFilterResponse> filterPublicTrialPrograms(
            String programName, String universityName, String majorName, Pageable pageable) {

        log.info("Bắt đầu lọc khóa học thử với các tiêu chí: programName='{}', universityName='{}', majorName='{}'",
                programName, universityName, majorName);

        // 1. Bắt đầu với một Specification rỗng, luôn đúng
        Specification<TrialProgram> spec = Specification.where(null);

        // 2. Nối các điều kiện một cách tuần tự
        if (StringUtils.hasText(programName)) {
            spec = spec.and(TrialProgramSpecification.byProgramName(programName));
        }
        if (StringUtils.hasText(universityName)) {
            spec = spec.and(TrialProgramSpecification.byUniversityName(universityName));
        }
        if (StringUtils.hasText(majorName)) {
            spec = spec.and(TrialProgramSpecification.byMajorName(majorName));
        }

        // 3. Thực thi truy vấn với Specification cuối cùng
        Page<TrialProgram> programsPage = trialProgramRepository.findAll(spec, pageable);

        return programsPage.map(trialProgramMapper::toTrialProgramFilterResponse);
    }
}
