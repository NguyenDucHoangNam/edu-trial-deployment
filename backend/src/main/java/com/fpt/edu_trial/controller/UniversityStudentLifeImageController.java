package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.UniversityStudentLifeImageCreateRequest;
import com.fpt.edu_trial.dto.request.UniversityStudentLifeImageUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.UniversityStudentLifeImageResponse;
import com.fpt.edu_trial.service.UniversityStudentLifeImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
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
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/university-student-life-images")
@RequiredArgsConstructor
@Tag(name = "University Student Life Image Management", description = "APIs for managing university student life images")
public class UniversityStudentLifeImageController {

    private final UniversityStudentLifeImageService studentLifeImageService;

    @GetMapping("/my-images")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my university's student life images (Paged)", description = "Lấy danh sách (có phân trang) các ảnh đời sống sinh viên thuộc về trường của người dùng đang đăng nhập.")
    public ResponseEntity<ApiResponse> getMyStudentLifeImages(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable) {
        Page<UniversityStudentLifeImageResponse> imagesPage = studentLifeImageService.getMyStudentLifeImages(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách ảnh của trường bạn thành công.")
                .data(imagesPage)
                .build());
    }

    @GetMapping("/{imageId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my specific student life image by ID", description = "Lấy thông tin chi tiết một ảnh theo ID, ảnh phải thuộc trường của người dùng.")
    public ResponseEntity<ApiResponse> getMyStudentLifeImageById(
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails currentUser) {
        UniversityStudentLifeImageResponse image = studentLifeImageService.getMyStudentLifeImageById(imageId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin ảnh thành công.")
                .data(image)
                .build());
    }

    @GetMapping("/public/by-university/{universityId}")
    @Operation(summary = "Get public student life images by University ID (Paged)", description = "Lấy danh sách (có phân trang) các ảnh đời sống sinh viên của một trường bất kỳ.")
    public ResponseEntity<ApiResponse> getPublicStudentLifeImagesByUniversity(
            @PathVariable Long universityId,
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable) {
        Page<UniversityStudentLifeImageResponse> imagesPage = studentLifeImageService.getPublicStudentLifeImagesByUniversity(universityId, pageable);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách ảnh đời sống sinh viên thành công.")
                .data(imagesPage)
                .build());
    }

    @GetMapping("/public/{imageId}")
    @Operation(summary = "Get public student life image by ID", description = "Lấy thông tin chi tiết một ảnh đời sống sinh viên công khai bất kỳ theo ID.")
    public ResponseEntity<ApiResponse> getPublicStudentLifeImageById(@PathVariable Long imageId) {
        UniversityStudentLifeImageResponse image = studentLifeImageService.getPublicStudentLifeImageById(imageId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin ảnh công khai thành công.")
                .data(image)
                .build());
    }

    // GHI CHÚ: Đã xóa hàm getPublicStudentLifeImages bị trùng lặp ở đây.

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new university student life image",
            description = "Creates a new student life image for the university managed by the authenticated user. " +
                    "Requires UNIVERSITY role. Image file is mandatory.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UniversityStudentLifeImageCreateRequest.class)))
    )
    public ResponseEntity<ApiResponse> createStudentLifeImage(
            @RequestPart(value = "imageData", required = false) UniversityStudentLifeImageCreateRequest imageCreateRequest,
            @RequestPart(value = "imageFile") MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        UniversityStudentLifeImageCreateRequest finalRequest = (imageCreateRequest != null) ? imageCreateRequest : new UniversityStudentLifeImageCreateRequest();
        finalRequest.setImageFile(imageFile);

        UniversityStudentLifeImageResponse imageResponse = studentLifeImageService.createStudentLifeImage(finalRequest, currentUser);

        return new ResponseEntity<>(ApiResponse.builder()
                .success(true)
                .message("Tạo ảnh đời sống sinh viên cho trường đại học thành công!")
                .data(imageResponse)
                .build(), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{imageId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a university student life image's name/caption and/or image file",
            description = "Updates the name (caption) and/or the image file of an existing student life image. " +
                    "Requires UNIVERSITY role and the image must belong to the user's university. " +
                    "Both 'imageData' (for name) and 'imageFile' are optional, but at least one should be provided for an update to occur.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UniversityStudentLifeImageUpdateRequest.class)))
    )
    public ResponseEntity<ApiResponse> updateStudentLifeImage(
            @PathVariable Long imageId,
            @RequestPart(value = "imageData", required = false) UniversityStudentLifeImageUpdateRequest updateRequestJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        UniversityStudentLifeImageUpdateRequest finalUpdateRequest = (updateRequestJson != null) ? updateRequestJson : new UniversityStudentLifeImageUpdateRequest();
        if (imageFile != null && !imageFile.isEmpty()) {
            finalUpdateRequest.setImageFile(imageFile);
        }

        if (!StringUtils.hasText(finalUpdateRequest.getName()) && (finalUpdateRequest.getImageFile() == null || finalUpdateRequest.getImageFile().isEmpty())) {
            return ResponseEntity.badRequest().body(ApiResponse.builder().success(false).message("Không có thông tin nào được cung cấp để cập nhật.").build());
        }

        UniversityStudentLifeImageResponse updatedImage = studentLifeImageService.updateStudentLifeImage(imageId, finalUpdateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật thông tin ảnh thành công.").data(updatedImage).build());
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a university student life image",
            description = "Deletes a student life image. " +
                    "Requires UNIVERSITY role and the image must belong to the user's university. " +
                    "The image will also be deleted from Cloudinary.")
    public ResponseEntity<ApiResponse> deleteStudentLifeImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails currentUser) {

        studentLifeImageService.deleteStudentLifeImage(imageId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa ảnh đời sống sinh viên thành công.").build());
    }
}