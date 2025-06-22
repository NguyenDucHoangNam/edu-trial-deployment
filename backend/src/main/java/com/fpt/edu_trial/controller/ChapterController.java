package com.fpt.edu_trial.controller;


import com.fpt.edu_trial.dto.request.ChapterCreateRequest;
import com.fpt.edu_trial.dto.request.ChapterUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.ChapterResponse;
import com.fpt.edu_trial.service.ChapterService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/v1/chapters")
@RequiredArgsConstructor
@Tag(name = "Chapter Management", description = "APIs for managing chapters within a trial program")
public class ChapterController {

    private final ChapterService chapterService;

    // Đổi lại URL để rõ ràng hơn: tạo chapter cho một program cụ thể
    @PostMapping("/for-program/{programId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new chapter for a trial program")
    public ResponseEntity<ApiResponse> createChapter(
            @PathVariable Long programId,
            @Valid @RequestBody ChapterCreateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {

        ChapterResponse response = chapterService.createChapter(programId, request, currentUser);
        return new ResponseEntity<>(ApiResponse.builder().success(true).message("Tạo chương mới thành công.").data(response).build(), HttpStatus.CREATED);
    }

    @PutMapping("/{chapterId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing chapter")
    public ResponseEntity<ApiResponse> updateChapter(
            @PathVariable Long chapterId,
            @Valid @RequestBody ChapterUpdateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {

        ChapterResponse response = chapterService.updateChapter(chapterId, request, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật chương thành công.").data(response).build());
    }

    @DeleteMapping("/{chapterId}")
    @PreAuthorize("hasRole('UNIVERSITY')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a chapter")
    public ResponseEntity<ApiResponse> deleteChapter(@PathVariable Long chapterId, @AuthenticationPrincipal UserDetails currentUser) {
        chapterService.deleteChapter(chapterId, currentUser);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa chương thành công.").build());
    }

    @GetMapping("/public/by-program/{programId}")
    @Operation(summary = "Get all chapters of a trial program (Paged)")
    public ResponseEntity<ApiResponse> getChaptersByProgram(
            @PathVariable Long programId,
            @PageableDefault(sort = "orderIndex") Pageable pageable) {

        Page<ChapterResponse> response = chapterService.getChaptersByProgram(programId, pageable);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách chương thành công.").data(response).build());
    }

    @GetMapping("/public/{chapterId}")
    @Operation(summary = "Get a single chapter by ID")
    public ResponseEntity<ApiResponse> getChapterById(@PathVariable Long chapterId) {
        ChapterResponse response = chapterService.getChapterById(chapterId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy thông tin chương thành công.").data(response).build());
    }
}
