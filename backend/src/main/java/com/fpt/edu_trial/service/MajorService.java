package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.MajorCreateRequest;
import com.fpt.edu_trial.dto.request.MajorUpdateRequest;
import com.fpt.edu_trial.dto.response.MajorResponse;
import com.fpt.edu_trial.entity.Faculty;
import com.fpt.edu_trial.entity.Major;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.MajorMapper;
import com.fpt.edu_trial.repository.FacultyRepository;
import com.fpt.edu_trial.repository.MajorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MajorService {

    private final MajorRepository majorRepository;
    private final FacultyRepository facultyRepository;
    private final MajorMapper majorMapper;
    private final CloudinaryUploadService cloudinaryUploadService;

    @Transactional
    public MajorResponse createMajor(MajorCreateRequest request) {
        log.info("Bắt đầu tạo ngành học với tên: '{}' cho khoa ID: {}", request.getName(), request.getFacultyId());

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khoa với ID: " + request.getFacultyId()));

        majorRepository.findByNameAndFacultyId(request.getName(), request.getFacultyId()).ifPresent(m -> {
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Tên ngành '" + request.getName() + "' đã tồn tại trong khoa '" + faculty.getName() + "'.");
        });

        Major major = majorMapper.toMajor(request);
        major.setFaculty(faculty);

        University university = faculty.getUniversity();
        if (university == null) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể xác định trường đại học của khoa ID: " + faculty.getId());
        }
        major.setUniversity(university);

        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            String folderName = "edu_trial/majors";
            String imageUrl = cloudinaryUploadService.uploadFile(request.getImageFile(), folderName);
            major.setImageUrl(imageUrl);
        }

        Major savedMajor = majorRepository.save(major);
        log.info("Tạo ngành học thành công với ID: {}", savedMajor.getId());
        return majorMapper.toMajorResponse(savedMajor);
    }

    @Transactional
    public MajorResponse updateMajor(Long majorId, MajorUpdateRequest request) {
        log.info("Bắt đầu cập nhật ngành học ID: {}", majorId);

        Major majorToUpdate = majorRepository.findById(majorId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ngành với ID: " + majorId));

        boolean isModified = false;

        if (request.getDescription() != null && !request.getDescription().equals(majorToUpdate.getDescription())) {
            majorToUpdate.setDescription(request.getDescription());
            isModified = true;
        }

        if (StringUtils.hasText(request.getName()) && !request.getName().equals(majorToUpdate.getName())) {
            Long facultyIdToCheck = (request.getFacultyId() != null) ? request.getFacultyId() : majorToUpdate.getFaculty().getId();
            majorRepository.findByNameAndFacultyId(request.getName(), facultyIdToCheck).ifPresent(existingMajor -> {
                if (!existingMajor.getId().equals(majorId)) {
                    throw new AppException(ErrorCode.DUPLICATE_RESOURCE, "Tên ngành '" + request.getName() + "' đã được sử dụng bởi một ngành khác trong cùng khoa.");
                }
            });
            majorToUpdate.setName(request.getName());
            isModified = true;
        }

        if (request.getFacultyId() != null && !request.getFacultyId().equals(majorToUpdate.getFaculty().getId())) {
            Faculty newFaculty = facultyRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khoa mới với ID: " + request.getFacultyId()));
            majorToUpdate.setFaculty(newFaculty);
            majorToUpdate.setUniversity(newFaculty.getUniversity());
            isModified = true;
        }

        MultipartFile newImageFile = request.getImageFile();
        Boolean removeCurrentImage = request.getRemoveCurrentImage();
        if (newImageFile != null && !newImageFile.isEmpty()) {
            deleteImageFromCloudinary(majorToUpdate.getImageUrl());
            String newImageUrl = cloudinaryUploadService.uploadFile(newImageFile, "edu_trial/majors");
            majorToUpdate.setImageUrl(newImageUrl);
            isModified = true;
        } else if (removeCurrentImage != null && removeCurrentImage) {
            deleteImageFromCloudinary(majorToUpdate.getImageUrl());
            majorToUpdate.setImageUrl(null);
            isModified = true;
        }

        if (isModified) {
            Major updatedMajor = majorRepository.save(majorToUpdate);
            log.info("Ngành ID: {} đã được cập nhật thành công trong DB.", majorId);
            return majorMapper.toMajorResponse(updatedMajor);
        }

        return majorMapper.toMajorResponse(majorToUpdate);
    }

    @Transactional
    public void deleteMajor(Long majorId) {
        log.info("Bắt đầu xóa ngành học ID: {}", majorId);
        Major majorToDelete = majorRepository.findById(majorId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ngành với ID: " + majorId));

        deleteImageFromCloudinary(majorToDelete.getImageUrl());
        majorRepository.delete(majorToDelete);
        log.info("Ngành ID: {} đã được xóa thành công.", majorId);
    }

    private void deleteImageFromCloudinary(String imageUrl) {
        if (StringUtils.hasText(imageUrl)) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinaryUploadService.deleteFileByPublicId(publicId);
            }
        }
    }

    // Các phương thức GET không đổi
    @Transactional(readOnly = true)
    public List<MajorResponse> getAllMajors() {
        return majorRepository.findAll().stream()
                .map(majorMapper::toMajorResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MajorResponse> getAllMajors(Pageable pageable) {
        return majorRepository.findAll(pageable)
                .map(majorMapper::toMajorResponse);
    }

    @Transactional(readOnly = true)
    public Page<MajorResponse> getAllMajorsByFaculty(Long facultyId, Pageable pageable) {
        if (!facultyRepository.existsById(facultyId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khoa với ID: " + facultyId);
        }
        return majorRepository.findByFacultyId(facultyId, pageable)
                .map(majorMapper::toMajorResponse);
    }

    @Transactional(readOnly = true)
    public List<MajorResponse> getAllMajorsByFaculty(Long facultyId) {
        if (!facultyRepository.existsById(facultyId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khoa với ID: " + facultyId);
        }
        return majorRepository.findByFacultyId(facultyId).stream()
                .map(majorMapper::toMajorResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MajorResponse getMajorById(Long majorId) {
        Major major = majorRepository.findById(majorId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy ngành với ID: " + majorId));
        return majorMapper.toMajorResponse(major);
    }
}