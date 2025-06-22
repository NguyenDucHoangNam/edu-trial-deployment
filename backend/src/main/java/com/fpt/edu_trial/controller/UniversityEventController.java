package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.UniversityEventCreateRequest;
import com.fpt.edu_trial.dto.request.UniversityEventUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.UniversityEventResponse;
import com.fpt.edu_trial.service.UniversityEventService;
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
@RequestMapping("/api/v1/university-events")
@RequiredArgsConstructor
@Tag(name = "University Event Management", description = "APIs for managing university events")
@SecurityRequirement(name = "bearerAuth")
public class UniversityEventController {

    private final UniversityEventService universityEventService;
    @GetMapping("/my-events")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my university's events (Paged)", description = "Lấy danh sách (có phân trang) các sự kiện thuộc về trường của người dùng đang đăng nhập.")
    public ResponseEntity<ApiResponse> getMyEvents(
            @AuthenticationPrincipal UserDetails currentUser,
            @PageableDefault(size = 10, sort = "date") Pageable pageable) {
        Page<UniversityEventResponse> eventsPage = universityEventService.getMyEvents(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách sự kiện của trường bạn thành công.")
                .data(eventsPage)
                .build());
    }

    @GetMapping("/{eventId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get my specific event by ID", description = "Lấy thông tin chi tiết một sự kiện theo ID, sự kiện phải thuộc trường của người dùng.")
    public ResponseEntity<ApiResponse> getMyEventById(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails currentUser) {
        UniversityEventResponse event = universityEventService.getMyEventById(eventId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin sự kiện thành công.")
                .data(event)
                .build());
    }

    @GetMapping("/public/by-university/{universityId}")
    @Operation(summary = "Get public events by University ID (Paged)", description = "Lấy danh sách (có phân trang) các sự kiện của một trường bất kỳ.")
    public ResponseEntity<ApiResponse> getPublicEventsByUniversity(
            @PathVariable Long universityId,
            @PageableDefault(size = 10, sort = "date") Pageable pageable) {
        Page<UniversityEventResponse> eventsPage = universityEventService.getPublicEventsByUniversity(universityId, pageable);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy danh sách sự kiện công khai của trường thành công.")
                .data(eventsPage)
                .build());
    }

    @GetMapping("/public/{eventId}")
    @Operation(summary = "Get public event by ID", description = "Lấy thông tin chi tiết một sự kiện công khai bất kỳ theo ID.")
    public ResponseEntity<ApiResponse> getPublicEventById(@PathVariable Long eventId) {
        UniversityEventResponse event = universityEventService.getPublicEventById(eventId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Lấy thông tin sự kiện công khai thành công.")
                .data(event)
                .build());
    }
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Create a new university event",
            description = "Creates a new event for the university managed by the authenticated user. " +
                    "Requires UNIVERSITY role. Event image is an optional file upload.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UniversityEventCreateRequest.class)))
    )
    public ResponseEntity<ApiResponse> createUniversityEvent(
            @Valid @RequestPart("eventData") UniversityEventCreateRequest eventCreateRequest,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (currentUser == null) {
            return new ResponseEntity<>(
                    ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(),
                    HttpStatus.UNAUTHORIZED);
        }

        if (imageFile != null && !imageFile.isEmpty()) {
            eventCreateRequest.setImageFile(imageFile);
        }

        UniversityEventResponse eventResponse = universityEventService.createUniversityEvent(eventCreateRequest, currentUser);

        ApiResponse apiResponse = ApiResponse.builder()
                .success(true)
                .message("Tạo sự kiện trường đại học thành công!")
                .data(eventResponse)
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{eventId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Update an existing university event",
            description = "Updates an existing event for the university managed by the authenticated user. " +
                    "Requires UNIVERSITY role. All fields in the request are optional. " +
                    "If 'imageFile' is provided, the existing image will be replaced.",
            requestBody = @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                    schema = @Schema(implementation = UniversityEventUpdateRequest.class)))
    )
    public ResponseEntity<ApiResponse> updateUniversityEvent(
            @PathVariable Long eventId,
            // Dùng @RequestPart cho từng phần của multipart request
            @RequestPart(value = "eventData", required = false) @Valid UniversityEventUpdateRequest eventUpdateRequestJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }

        UniversityEventUpdateRequest finalUpdateRequest =
                (eventUpdateRequestJson != null) ? eventUpdateRequestJson : new UniversityEventUpdateRequest();

        if (imageFile != null && !imageFile.isEmpty()) {
            finalUpdateRequest.setImageFile(imageFile);
        }

        // Kiểm tra xem có gì để cập nhật không
        boolean hasTextUpdate = finalUpdateRequest.getTitle() != null ||
                finalUpdateRequest.getDate() != null ||
                finalUpdateRequest.getDescription() != null ||
                finalUpdateRequest.getLocation() != null ||
                finalUpdateRequest.getLink() != null;
        boolean hasImageUpdate = finalUpdateRequest.getImageFile() != null && !finalUpdateRequest.getImageFile().isEmpty();

        if (!hasTextUpdate && !hasImageUpdate) {
            return ResponseEntity.badRequest().body(ApiResponse.builder().success(false).message("Không có thông tin nào được cung cấp để cập nhật.").build());
        }

        UniversityEventResponse updatedEvent = universityEventService.updateUniversityEvent(eventId, finalUpdateRequest, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật sự kiện thành công.").data(updatedEvent).build());
    }

    @DeleteMapping("/{eventId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @Operation(summary = "Delete a university event",
            description = "Deletes an event. Requires UNIVERSITY role and the event must belong to the user's university. " +
                    "The event image will also be deleted from Cloudinary.")
    public ResponseEntity<ApiResponse> deleteUniversityEvent(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetails currentUser) {

        if (currentUser == null) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Không thể xác định người dùng hiện tại.").build(), HttpStatus.UNAUTHORIZED);
        }
        universityEventService.deleteUniversityEvent(eventId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa sự kiện thành công.").build());
    }
}
