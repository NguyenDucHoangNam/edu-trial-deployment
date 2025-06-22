package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.DocumentCreateRequest;
import com.fpt.edu_trial.dto.request.DocumentUpdateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.DocumentResponse;
import com.fpt.edu_trial.enums.DocumentSubject;
import com.fpt.edu_trial.enums.DocumentType;
import com.fpt.edu_trial.service.DocumentService;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ModelAttribute;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "National Exam Document Management", description = "APIs for THPT Quốc Gia documents")
public class DocumentController {

    private final DocumentService documentService;

    // ... (Giữ nguyên các endpoint CRUD: create, update, delete)

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Upload a new document", description = "Requires STAFF or ADMIN role.")
    public ResponseEntity<ApiResponse> createDocument(@Valid @ModelAttribute DocumentCreateRequest request) {
        DocumentResponse response = documentService.createDocument(request);
        return new ResponseEntity<>(ApiResponse.builder()
                .success(true)
                .message("Tải tài liệu lên thành công.")
                .data(response)
                .build(), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{documentId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update an existing document", description = "Requires STAFF or ADMIN role. All fields are optional.")
    public ResponseEntity<ApiResponse> updateDocument(
            @PathVariable Long documentId,
            @Valid @ModelAttribute DocumentUpdateRequest request) {
        DocumentResponse response = documentService.updateDocument(documentId, request);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật tài liệu thành công.").data(response).build());
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a document", description = "Requires STAFF or ADMIN role.")
    public ResponseEntity<ApiResponse> deleteDocument(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa tài liệu thành công.").build());
    }

    // ----- CÁC ENDPOINT PUBLIC CHO NGƯỜI DÙNG -----

    @GetMapping("/public/grouped-by-year")
    @Operation(summary = "Lọc và nhóm tài liệu theo năm",
            description = "Lọc tài liệu theo năm, môn học, loại tài liệu. Các tham số đều là tùy chọn.")
    public ResponseEntity<ApiResponse> getDocumentsGroupedByYear(
            @Parameter(description = "Lọc theo năm cụ thể")
            @RequestParam(required = false) Integer year,

            @Parameter(description = "Lọc theo môn học")
            @RequestParam(required = false) DocumentSubject subject,

            @Parameter(description = "Lọc theo loại tài liệu")
            @RequestParam(required = false) DocumentType type) {

        Map<Integer, List<DocumentResponse>> groupedData = documentService.getFilteredAndGroupedDocuments(year, subject, type);

        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Lấy tài liệu thành công.")
                        .data(groupedData)
                        .build()
        );
    }

    @GetMapping("/public/filter")
    @Operation(summary = "Filter documents with pagination (Public)", description = "Filter documents by year, subject, and type.")
    public ResponseEntity<ApiResponse> filterDocuments(
            @Parameter(description = "Lọc theo năm") @RequestParam(required = false) Integer year, // <-- THAY ĐỔI
            @Parameter(description = "Lọc theo môn học") @RequestParam(required = false) DocumentSubject subject,
            @Parameter(description = "Lọc theo loại tài liệu") @RequestParam(required = false) DocumentType type,
            @PageableDefault(size = 9, sort = "year") Pageable pageable) {

        Page<DocumentResponse> resultPage = documentService.filterDocuments(year, subject, type, pageable); // <-- THAY ĐỔI
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lọc tài liệu thành công.").data(resultPage).build());
    }

    @GetMapping("/public/all")
    @Operation(summary = "Lấy tất cả tài liệu (có phân trang)",
            description = "Trả về một danh sách phẳng các tài liệu, hữu ích cho bảng dữ liệu ở trang admin.")
    public ResponseEntity<ApiResponse> getAllDocuments(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        Page<DocumentResponse> resultPage = documentService.getAllDocuments(pageable);

        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .message("Lấy tất cả tài liệu thành công.")
                        .data(resultPage)
                        .build()
        );
    }
}