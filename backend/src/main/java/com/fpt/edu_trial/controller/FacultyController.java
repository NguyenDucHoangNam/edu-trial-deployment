package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.FacultyCreateRequest;
import com.fpt.edu_trial.dto.request.FacultyUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.FacultyResponse;
import com.fpt.edu_trial.service.FacultyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/my-faculties")
@RequiredArgsConstructor
@Tag(name = "My Faculty Management", description = "APIs for a university to manage its OWN faculties")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('UNIVERSITY')")
public class FacultyController {

    private final FacultyService facultyService;

    @GetMapping
    @Operation(summary = "Get my university's faculties")
    public ResponseEntity<ApiResponse> getMyFaculties(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {

        Page<FacultyResponse> myFaculties = facultyService.getMyFaculties(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách khoa của bạn thành công.")
                .data(myFaculties)
                .build());
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}) // Thêm consumes
    @Operation(summary = "Create a new faculty for my university")
    public ResponseEntity<ApiResponse> createMyFaculty(
            @Valid @RequestPart("facultyData") FacultyCreateRequest request, // Sửa thành @RequestPart
            @RequestPart(required = false) MultipartFile imageFile,      // Thêm @RequestPart cho file
            @AuthenticationPrincipal UserDetails currentUser) {

        request.setImageFile(imageFile); // Gán file vào DTO
        FacultyResponse newFaculty = facultyService.createFacultyForMyUniversity(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.builder()
                .success(true)
                .message("Tạo khoa mới thành công.")
                .data(newFaculty)
                .build());
    }

    @PutMapping(value = "/{facultyId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}) // Thêm consumes
    @Operation(summary = "Update one of my faculties")
    public ResponseEntity<ApiResponse> updateMyFaculty(
            @PathVariable Long facultyId,
            @Valid @RequestPart("facultyData") FacultyUpdateRequest request, // Sửa thành @RequestPart
            @RequestPart(required = false) MultipartFile imageFile,      // Thêm @RequestPart cho file
            @AuthenticationPrincipal UserDetails currentUser) {

        request.setImageFile(imageFile); // Gán file vào DTO
        FacultyResponse updatedFaculty = facultyService.updateMyFaculty(facultyId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Cập nhật khoa thành công.")
                .data(updatedFaculty)
                .build());
    }

    @DeleteMapping("/{facultyId}")
    @Operation(summary = "Delete one of my faculties")
    public ResponseEntity<ApiResponse> deleteMyFaculty(
            @PathVariable Long facultyId,
            @AuthenticationPrincipal UserDetails currentUser) {

        facultyService.deleteMyFaculty(facultyId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Xóa khoa thành công.")
                .build());
    }
}