package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.LessonCreateRequest;
import com.fpt.edu_trial.dto.request.LessonUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.LessonResponse;
import com.fpt.edu_trial.service.LessonService;
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
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
@Tag(name = "Lesson Management", description = "APIs for managing lessons within a chapter")
public class LessonController {

    private final LessonService lessonService;

    // SỬA ĐỔI: Chuyển sang dùng @ModelAttribute
    @PostMapping(value = "/for-chapter/{chapterId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new lesson for a chapter")
    public ResponseEntity<ApiResponse> createLesson(
            @PathVariable Long chapterId,
            // Dùng @ModelAttribute để Spring tự động bind các trường form-data và file vào DTO
            @Valid @ModelAttribute LessonCreateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {

        // Không cần gán file nữa, Spring đã làm việc đó
        LessonResponse response = lessonService.createLesson(chapterId, request, currentUser);
        return new ResponseEntity<>(ApiResponse.builder().success(true).message("Tạo bài học mới thành công.").data(response).build(), HttpStatus.CREATED);
    }

    // SỬA ĐỔI: Chuyển sang dùng @ModelAttribute
    @PutMapping(value = "/{lessonId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing lesson")
    public ResponseEntity<ApiResponse> updateLesson(
            @PathVariable Long lessonId,
            @Valid @ModelAttribute LessonUpdateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {

        // Không cần gán file nữa
        LessonResponse response = lessonService.updateLesson(lessonId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật bài học thành công.").data(response).build());
    }

    // Các hàm GET và DELETE không thay đổi
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a lesson")
    public ResponseEntity<ApiResponse> deleteLesson(@PathVariable Long lessonId, @AuthenticationPrincipal UserDetails currentUser) {
        lessonService.deleteLesson(lessonId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa bài học thành công.").build());
    }

    @GetMapping("/public/by-chapter/{chapterId}")
    @Operation(summary = "Get all lessons of a chapter (Paged)")
    public ResponseEntity<ApiResponse> getLessonsByChapter(
            @PathVariable Long chapterId,
            @PageableDefault(sort = "orderIndex") Pageable pageable) {

        Page<LessonResponse> response = lessonService.getLessonsByChapter(chapterId, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách bài học thành công.").data(response).build());
    }

    @GetMapping("/public/{lessonId}")
    @Operation(summary = "Get a single lesson by ID")
    public ResponseEntity<ApiResponse> getLessonById(@PathVariable Long lessonId) {
        LessonResponse response = lessonService.getLessonById(lessonId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin bài học thành công.").data(response).build());
    }
}
