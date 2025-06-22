package com.fpt.edu_trial.controller;


import com.fpt.edu_trial.dto.request.UniversityCreateRequest;
import com.fpt.edu_trial.dto.request.UpdateUniversityFacultiesRequest;
import com.fpt.edu_trial.dto.response.*;
import com.fpt.edu_trial.service.UniversityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/v1/universities")
@RequiredArgsConstructor
@Tag(name = "University Management", description = "APIs for managing universities")
@SecurityRequirement(name = "bearerAuth")
public class UniversityController {

    private final UniversityService universityService;

    @GetMapping("/public/detail/{id}")
    @Operation(summary = "Get full university details for public introduction page",
            description = "Lấy toàn bộ thông tin chi tiết của một trường, bao gồm các khoa, ngành, học bổng, sự kiện...")
    public ResponseEntity<ApiResponse> getFullUniversityDetail(@PathVariable Long id) {
        UniversityDetailResponse universityDetail = universityService.getUniversityDetail(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin chi tiết của trường thành công.")
                .data(universityDetail)
                .build());
    }

    @GetMapping("/public/filter")
    @Operation(summary = "Filter and search public universities (Paged)",
            description = "Lọc danh sách trường đại học (có phân trang) theo tên trường/tên viết tắt và/hoặc theo tên ngành học.")
    public ResponseEntity<ApiResponse> filterPublicUniversities(
            @Parameter(description = "Từ khóa tìm kiếm theo tên trường hoặc tên viết tắt.")
            @RequestParam(required = false) String name,

            @Parameter(description = "Từ khóa tìm kiếm theo tên ngành học.")
            @RequestParam(required = false) String major,

            @PageableDefault(size = 10, sort = "name") Pageable pageable) {

        Page<UniversityFilterResponse> resultPage = universityService.filterPublicUniversities(name, major, pageable);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lọc danh sách trường thành công.")
                .data(resultPage)
                .build());
    }

    @GetMapping("/public/profile/{identifier}")
    @Operation(summary = "Get public university profile by ID or Short Name",
            description = "Retrieves basic public profile information about a university using its ID or short name.")
    public ResponseEntity<ApiResponse> getPublicUniversityProfile(@PathVariable String identifier) {
        UniversityProfileResponse universityProfile = universityService.getUniversityProfileByIdentifier(identifier);
        ApiResponse apiResponse = ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin profile trường đại học thành công.")
                .data(universityProfile)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/my-profile") // Giữ nguyên path này
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my university's profile",
            description = "Retrieves basic profile information for the university managed by the currently authenticated user. Requires UNIVERSITY role.")
    public ResponseEntity<ApiResponse> getMyUniversityProfile(@AuthenticationPrincipal UserDetails currentUser) {
        if (currentUser == null) {
            return new ResponseEntity<>(
                    ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(),
                    HttpStatus.UNAUTHORIZED);
        }
        UniversityProfileResponse universityProfile = universityService.getMyUniversityProfile(currentUser);
        ApiResponse apiResponse = ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin profile trường của bạn thành công.")
                .data(universityProfile)
                .build();
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping(value = "/my-profile", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create or Update My University Profile",
            description = "Creates a university profile if it doesn't exist for the current user, or updates it if it already exists.")
    public ResponseEntity<ApiResponse> upsertMyProfile(
            @Valid @RequestPart("profileData") UniversityCreateRequest request,
            @RequestPart(value = "logoFile", required = false) MultipartFile logoFile,
            @RequestPart(value = "coverImageFile", required = false) MultipartFile coverImageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        request.setLogoFile(logoFile);
        request.setCoverImageFile(coverImageFile);

        UniversityProfileResponse response = universityService.upsertMyProfile(request, currentUser);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Cập nhật thông tin trường thành công.")
                .data(response)
                .build());
    }

}

