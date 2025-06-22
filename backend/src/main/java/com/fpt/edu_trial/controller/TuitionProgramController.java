package com.fpt.edu_trial.controller;


import com.fpt.edu_trial.dto.request.TuitionProgramCreateRequest;
import com.fpt.edu_trial.dto.request.TuitionProgramUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.TuitionProgramResponse;
import com.fpt.edu_trial.service.TuitionProgramService;
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
@RequestMapping("/api/v1/tuition-programs")
@RequiredArgsConstructor
@Tag(name = "Tuition Program Management", description = "APIs for managing university tuition programs")
public class TuitionProgramController {

    private final TuitionProgramService tuitionProgramService;

    @PostMapping
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new tuition program for the university",
            description = "Creates a new tuition program associated with the authenticated university user. Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> createTuitionProgram(
            @Valid @RequestBody TuitionProgramCreateRequest createRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        TuitionProgramResponse response = tuitionProgramService.createTuitionProgram(createRequest, currentUser);
        return new ResponseEntity<>(ApiResponse.builder().success(true).message("Tạo chương trình học phí thành công!").data(response).build(), HttpStatus.CREATED);
    }

    @PutMapping("/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing tuition program",
            description = "Updates an existing tuition program. Requires UNIVERSITY role and the program must belong to the user's university.")
    public ResponseEntity<ApiResponse> updateTuitionProgram(
            @PathVariable Long programId,
            @Valid @RequestBody TuitionProgramUpdateRequest updateRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        TuitionProgramResponse response = tuitionProgramService.updateTuitionProgram(programId, updateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật chương trình học phí thành công.").data(response).build());
    }

    @DeleteMapping("/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Delete a tuition program",
            description = "Deletes a tuition program. Requires UNIVERSITY role and the program must belong to the user's university.")
    public ResponseEntity<ApiResponse> deleteTuitionProgram(
            @PathVariable Long programId,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        tuitionProgramService.deleteTuitionProgram(programId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa chương trình học phí thành công.").build());
    }

    // Endpoint cho trường tự xem danh sách học phí của mình
    @GetMapping("/my-university")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all tuition programs for the authenticated user's university",
            description = "Retrieves a paginated list of tuition programs for the university managed by the current user.")
    public ResponseEntity<ApiResponse> getMyUniversityTuitionPrograms(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 10, sort = "programName") Pageable pageable) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        Page<TuitionProgramResponse> programsPage = tuitionProgramService.getMyTuitionPrograms(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương trình học phí của trường thành công.").data(programsPage).build());
    }

    // Endpoint cho trường tự xem chi tiết một chương trình học phí của mình
    @GetMapping("/my-university/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get a specific tuition program for the authenticated user's university",
            description = "Retrieves details of a specific tuition program belonging to the current user's university.")
    public ResponseEntity<ApiResponse> getMyUniversityTuitionProgramById(
            @PathVariable Long programId,
            @AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        TuitionProgramResponse program = tuitionProgramService.getTuitionProgramByIdForUniversity(programId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin chương trình học phí thành công.").data(program).build());
    }

    // --- Public Endpoints ---
    @GetMapping("/public/by-university/{universityId}")
    @Operation(summary = "Get all tuition programs for a specific university (Public)",
            description = "Retrieves a paginated list of tuition programs for a given university ID.")
    public ResponseEntity<ApiResponse> getPublicTuitionProgramsByUniversity(
            @PathVariable Long universityId,
            @PageableDefault(size = 10, sort = "programName") Pageable pageable) {
        Page<TuitionProgramResponse> programsPage = tuitionProgramService.getTuitionProgramsByUniversity(universityId, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương trình học phí công khai của trường thành công.").data(programsPage).build());
    }

    @GetMapping("/public/{programId}")
    @Operation(summary = "Get a specific tuition program by ID (Public)",
            description = "Retrieves details of a specific tuition program by its ID.")
    public ResponseEntity<ApiResponse> getPublicTuitionProgramById(@PathVariable Long programId) {
        TuitionProgramResponse program = tuitionProgramService.getPublicTuitionProgramById(programId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin chương trình học phí công khai thành công.").data(program).build());
    }
}
