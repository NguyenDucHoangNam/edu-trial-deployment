package com.fpt.edu_trial.controller;


import com.fpt.edu_trial.dto.request.UniversityFacilitiesCreateRequest;
import com.fpt.edu_trial.dto.request.UniversityFacilitiesUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.UniversityFacilitiesResponse;
import com.fpt.edu_trial.service.UniversityFacilitiesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/university-facilities")
@RequiredArgsConstructor
@Tag(name = "University Facility Management", description = "APIs for managing university facilities")
@SecurityRequirement(name = "bearerAuth")
public class UniversityFacilitiesController {

    private final UniversityFacilitiesService universityFacilitiesService;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Create a new university facility",
            description = "Creates a new facility for the university managed by the authenticated user. " +
                    "Requires UNIVERSITY role. Facility image is a mandatory file upload.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UniversityFacilitiesCreateRequest.class)))
    )
    public ResponseEntity<ApiResponse> createUniversityFacility(
            @Valid @RequestPart("facilityData") UniversityFacilitiesCreateRequest facilityCreateRequest,
            @RequestPart(value = "imageFile") MultipartFile imageFile, // Ảnh là bắt buộc
            @AuthenticationPrincipal UserDetails currentUser) {

        if (currentUser == null) {
            return new ResponseEntity<>(
                    ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(),
                    HttpStatus.UNAUTHORIZED);
        }

        facilityCreateRequest.setImageFile(imageFile);

        UniversityFacilitiesResponse facilityResponse = universityFacilitiesService.createUniversityFacility(facilityCreateRequest, currentUser);

        ApiResponse apiResponse = ApiResponse.builder()
                .success(true)
                .message("Tạo cơ sở vật chất cho trường đại học thành công!")
                .data(facilityResponse)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{facilityId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Update an existing university facility",
            description = "Updates an existing facility for the university managed by the authenticated user. " +
                    "Requires UNIVERSITY role. 'facilityData' (for name) and 'imageFile' are optional, " +
                    "but at least one should be provided for an update.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UniversityFacilitiesUpdateRequest.class)))
    )
    public ResponseEntity<ApiResponse> updateUniversityFacility(
            @PathVariable Long facilityId,
            @RequestPart(value = "facilityData", required = false) @Valid UniversityFacilitiesUpdateRequest facilityUpdateRequestJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }

        UniversityFacilitiesUpdateRequest finalUpdateRequest =
                (facilityUpdateRequestJson != null) ? facilityUpdateRequestJson : new UniversityFacilitiesUpdateRequest();

        if (imageFile != null && !imageFile.isEmpty()) {
            finalUpdateRequest.setImageFile(imageFile);
        }

        // Kiểm tra xem có gì để cập nhật không
        boolean hasTextUpdate = StringUtils.hasText(finalUpdateRequest.getName());
        boolean hasImageUpdate = finalUpdateRequest.getImageFile() != null && !finalUpdateRequest.getImageFile().isEmpty();

        if (!hasTextUpdate && !hasImageUpdate) {
            return ResponseEntity.badRequest().body(ApiResponse.builder().success(false).message("Không có thông tin nào được cung cấp để cập nhật.").build());
        }

        UniversityFacilitiesResponse updatedFacility = universityFacilitiesService.updateUniversityFacility(facilityId, finalUpdateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật cơ sở vật chất thành công.").data(updatedFacility).build());
    }

    @DeleteMapping("/{facilityId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Delete a university facility",
            description = "Deletes a facility. Requires UNIVERSITY role and the facility must belong to the user's university. " +
                    "The facility image will also be deleted from Cloudinary.")
    public ResponseEntity<ApiResponse> deleteUniversityFacility(
            @PathVariable Long facilityId,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        universityFacilitiesService.deleteUniversityFacility(facilityId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa cơ sở vật chất thành công.").build());
    }
}
