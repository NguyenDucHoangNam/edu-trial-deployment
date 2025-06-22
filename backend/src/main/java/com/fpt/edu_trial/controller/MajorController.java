package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.MajorCreateRequest;
import com.fpt.edu_trial.dto.request.MajorUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.MajorResponse;
import com.fpt.edu_trial.service.MajorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/majors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('UNIVERSITY')")
@Tag(name = "Major Management (Admin/Staff)", description = "APIs for managing majors (Requires ADMIN or STAFF role)")
public class MajorController {

    private final MajorService majorService;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @Operation(summary = "Create a new major",
            description = "Creates a new major. Requires ADMIN or STAFF role. Major image is optional. Dữ liệu JSON của ngành học phải được gửi dưới dạng một part có tên là 'majorData'.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = MajorCreateRequest.class)))
    )
    public ResponseEntity<ApiResponse> createMajor(
            @Valid @RequestPart("majorData") MajorCreateRequest majorCreateRequest,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        majorCreateRequest.setImageFile(imageFile); // Gán file vào DTO
        MajorResponse majorResponse = majorService.createMajor(majorCreateRequest);

        ApiResponse apiResponse = ApiResponse.builder()
                .success(true)
                .message("Tạo ngành học thành công!")
                .data(majorResponse)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{majorId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @Operation(summary = "Update an existing major",
            description = "Updates an existing major. Requires ADMIN or STAFF role. " +
                    "All fields in 'majorData' and the 'imageFile' are optional. " +
                    "Set 'removeCurrentImage' to true in 'majorData' to delete the current image.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = MajorUpdateRequest.class)))
    )
    public ResponseEntity<ApiResponse> updateMajor(
            @PathVariable Long majorId,
            @Valid @RequestPart(value = "majorData") MajorUpdateRequest majorUpdateRequest,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile) {

        majorUpdateRequest.setImageFile(imageFile); // Gán file (nếu có) vào DTO
        MajorResponse updatedMajor = majorService.updateMajor(majorId, majorUpdateRequest);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Cập nhật ngành học thành công.")
                .data(updatedMajor)
                .build());
    }

    @DeleteMapping("/{majorId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a major", description = "Deletes a major by its ID. Requires ADMIN or STAFF role.")
    public ResponseEntity<ApiResponse> deleteMajor(@PathVariable Long majorId) {
        majorService.deleteMajor(majorId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Xóa ngành học thành công.")
                .build());
    }

    @GetMapping("/{majorId}")
    @Operation(summary = "Get major by ID (Public)", description = "Retrieves details of a specific major by its ID.")
    public ResponseEntity<ApiResponse> getMajorById(@PathVariable Long majorId) {
        MajorResponse major = majorService.getMajorById(majorId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin ngành học thành công.")
                .data(major)
                .build());
    }

    @GetMapping
    @Operation(summary = "Get all majors (Public)", description = "Retrieves a list of all majors. Can be filtered by facultyId.")
    public ResponseEntity<ApiResponse> getAllMajors(
            @Parameter(description = "Optional: Filter majors by Faculty ID") @RequestParam(required = false) Long facultyId) {
        List<MajorResponse> majors;
        if (facultyId != null) {
            majors = majorService.getAllMajorsByFaculty(facultyId);
        } else {
            majors = majorService.getAllMajors();
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách ngành học thành công.")
                .data(majors)
                .build());
    }

    @GetMapping("/paged")
    @Operation(summary = "Get all majors with pagination (Public)", description = "Retrieves a paginated list of all majors. Can be filtered by facultyId.")
    public ResponseEntity<ApiResponse> getAllMajorsPaged(
            @Parameter(description = "Optional: Filter majors by Faculty ID") @RequestParam(required = false) Long facultyId,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        Page<MajorResponse> majorsPage;
        if (facultyId != null) {
            majorsPage = majorService.getAllMajorsByFaculty(facultyId, pageable);
        } else {
            majorsPage = majorService.getAllMajors(pageable);
        }
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách ngành học phân trang thành công.")
                .data(majorsPage)
                .build());
    }
}