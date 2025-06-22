package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.ScholarshipProgramCreateRequest;
import com.fpt.edu_trial.dto.request.ScholarshipProgramUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.ScholarshipProgramResponse;
import com.fpt.edu_trial.service.ScholarshipProgramService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/scholarship-programs")
@RequiredArgsConstructor
@Tag(name = "Scholarship Program Management", description = "APIs for managing university scholarship programs")
public class ScholarshipProgramController {

    private final ScholarshipProgramService scholarshipProgramService;

    @PostMapping
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new scholarship program for the university",
            description = "Creates a new scholarship program associated with the authenticated university user. Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> createScholarshipProgram(
            @Valid @RequestBody ScholarshipProgramCreateRequest createRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        ScholarshipProgramResponse response = scholarshipProgramService.createScholarshipProgram(createRequest, currentUser);
        return new ResponseEntity<>(ApiResponse.builder().success(true).message("Tạo chương trình học bổng thành công!").data(response).build(), HttpStatus.CREATED);
    }

    @PutMapping("/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing scholarship program",
            description = "Updates an existing scholarship program. Requires UNIVERSITY role and the program must belong to the user's university.")
    public ResponseEntity<ApiResponse> updateScholarshipProgram(
            @PathVariable Long programId,
            @Valid @RequestBody ScholarshipProgramUpdateRequest updateRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        ScholarshipProgramResponse response = scholarshipProgramService.updateScholarshipProgram(programId, updateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật chương trình học bổng thành công.").data(response).build());
    }

    @DeleteMapping("/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a scholarship program",
            description = "Deletes a scholarship program. Requires UNIVERSITY role and the program must belong to the user's university.")
    public ResponseEntity<ApiResponse> deleteScholarshipProgram(
            @PathVariable Long programId,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        scholarshipProgramService.deleteScholarshipProgram(programId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa chương trình học bổng thành công.").build());
    }

    // Endpoint cho trường tự xem danh sách học bổng của mình
    @GetMapping("/my-university")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all scholarship programs for the authenticated user's university",
            description = "Retrieves a paginated list of scholarship programs for the university managed by the current user.")
    public ResponseEntity<ApiResponse> getMyUniversityScholarshipPrograms(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        Page<ScholarshipProgramResponse> programsPage = scholarshipProgramService.getMyScholarshipPrograms(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương trình học bổng của trường thành công.").data(programsPage).build());
    }

    // Endpoint cho trường tự xem chi tiết một học bổng của mình
    @GetMapping("/my-university/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get a specific scholarship program for the authenticated user's university",
            description = "Retrieves details of a specific scholarship program belonging to the current user's university.")
    public ResponseEntity<ApiResponse> getMyUniversityScholarshipProgramById(
            @PathVariable Long programId,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        ScholarshipProgramResponse program = scholarshipProgramService.getScholarshipProgramByIdForUniversity(programId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin chương trình học bổng thành công.").data(program).build());
    }


    // --- Public Endpoints (ví dụ) ---
    @GetMapping("/public/by-university/{universityId}")
    @Operation(summary = "Get all scholarship programs for a specific university (Public)",
            description = "Retrieves a paginated list of scholarship programs for a given university ID.")
    public ResponseEntity<ApiResponse> getPublicScholarshipProgramsByUniversity(
            @PathVariable Long universityId,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        Page<ScholarshipProgramResponse> programsPage = scholarshipProgramService.getScholarshipProgramsByUniversity(universityId, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương trình học bổng công khai của trường thành công.").data(programsPage).build());
    }

    @GetMapping("/public/{programId}")
    @Operation(summary = "Get a specific scholarship program by ID (Public)",
            description = "Retrieves details of a specific scholarship program by its ID.")
    public ResponseEntity<ApiResponse> getPublicScholarshipProgramById(@PathVariable Long programId) {
        ScholarshipProgramResponse program = scholarshipProgramService.getPublicScholarshipProgramById(programId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin chương trình học bổng công khai thành công.").data(program).build());
    }
}