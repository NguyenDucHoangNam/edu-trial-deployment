package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.TrialProgramCreateRequest;
import com.fpt.edu_trial.dto.request.TrialProgramUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.TrialProgramFilterResponse;
import com.fpt.edu_trial.dto.response.TrialProgramResponse;
import com.fpt.edu_trial.service.TrialProgramService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/v1/trial-programs")
@RequiredArgsConstructor
@Tag(name = "Trial Program Management", description = "APIs for managing university trial programs")
public class TrialProgramController {

    private final TrialProgramService trialProgramService;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new trial program", description = "Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> createTrialProgram(
            @Valid @RequestPart("data") TrialProgramCreateRequest request,
            @RequestPart(value = "coverImageFile", required = false) MultipartFile coverImageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        request.setCoverImageFile(coverImageFile);
        TrialProgramResponse response = trialProgramService.createTrialProgram(request, currentUser);
        return new ResponseEntity<>(ApiResponse.builder().success(true).message("Tạo chương trình học thử thành công!").data(response).build(), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{programId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a trial program", description = "Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> updateTrialProgram(
            @PathVariable Long programId,
            @Valid @RequestPart("data") TrialProgramUpdateRequest request,
            @RequestPart(value = "coverImageFile", required = false) MultipartFile coverImageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        request.setCoverImageFile(coverImageFile);
        TrialProgramResponse response = trialProgramService.updateTrialProgram(programId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật chương trình học thử thành công.").data(response).build());
    }

    @DeleteMapping("/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a trial program", description = "Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> deleteTrialProgram(@PathVariable Long programId, @AuthenticationPrincipal UserDetails currentUser) {
        trialProgramService.deleteTrialProgram(programId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa chương trình học thử thành công.").build());
    }

    @GetMapping("/my-programs")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my university's trial programs (Paged)", description = "Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> getMyTrialPrograms(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        Page<TrialProgramResponse> response = trialProgramService.getMyTrialPrograms(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương trình học thử của bạn thành công.").data(response).build());
    }

    @GetMapping("/public/by-university/{universityId}")
    @Operation(summary = "Get public trial programs by University ID (Paged)")
    public ResponseEntity<ApiResponse> getPublicTrialProgramsByUniversity(
            @PathVariable Long universityId,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        Page<TrialProgramResponse> response = trialProgramService.getPublicTrialProgramsByUniversity(universityId, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương trình học thử thành công.").data(response).build());
    }

    @GetMapping("public/{programId}")
    @Operation(summary = "Get a single trial program by ID")
    public ResponseEntity<ApiResponse> getTrialProgramById(@PathVariable Long programId) {
        TrialProgramResponse response = trialProgramService.getTrialProgramById(programId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin chương trình học thử thành công.").data(response).build());
    }

    @GetMapping("/public/filter")
    @Operation(summary = "Filter and search public trial programs (Paged)",
            description = "Lọc danh sách các khóa học thử theo tên khóa học, tên trường, và/hoặc tên ngành.")
    public ResponseEntity<ApiResponse> filterPublicTrialPrograms(
            @Parameter(description = "Tìm theo tên khóa học thử") @RequestParam(required = false) String programName,
            @Parameter(description = "Tìm theo tên trường") @RequestParam(required = false) String universityName,
            @Parameter(description = "Tìm theo tên ngành") @RequestParam(required = false) String majorName,
            @PageableDefault(size = 9, sort = "name") Pageable pageable) {

        Page<TrialProgramFilterResponse> response = trialProgramService.filterPublicTrialPrograms(programName, universityName, majorName, pageable);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lọc danh sách khóa học thử thành công.")
                .data(response)
                .build());
    }
}
