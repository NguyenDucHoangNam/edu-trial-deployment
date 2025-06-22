package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.AdmissionScoreRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.dto.response.AdmissionScoreResponse;
import com.fpt.edu_trial.enums.UniversityCode;
import com.fpt.edu_trial.service.AdmissionScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admission-scores")
@RequiredArgsConstructor
public class AdmissionScoreController {

    private final AdmissionScoreService admissionScoreService;

    // ========== ENDPOINTS CHO ADMIN & STAFF ==========
// Trong file AdmissionScoreController.java

    @PostMapping("/import-excel")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Nhập điểm chuẩn từ file Excel cho một trường và một năm cụ thể")
    public ResponseEntity<ApiResponse> importFromExcel(
            @Parameter(description = "File Excel chứa dữ liệu điểm chuẩn")
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "Mã của trường đại học")
            @RequestParam("universityCode") UniversityCode universityCode,

            @Parameter(description = "Năm của điểm chuẩn")
            @RequestParam("year") Integer year) {

        try {
            int count = admissionScoreService.importScoresFromExcel(file, universityCode, year);
            String message = String.format("Nhập thành công %d bản ghi điểm chuẩn cho trường %s năm %d.", count, universityCode, year);
            return ResponseEntity.ok(ApiResponse.builder().success(true).message(message).build());
        } catch (IOException e) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Lỗi khi đọc file: " + e.getMessage()).build(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/update-excel")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật hàng loạt điểm chuẩn từ file Excel")
    public ResponseEntity<ApiResponse> updateFromExcel(@RequestParam("file") MultipartFile file) {
        try {
            int[] result = admissionScoreService.updateScoresFromExcel(file);
            String message = String.format("Hoàn tất. Đã cập nhật %d bản ghi, bỏ qua %d bản ghi không tìm thấy ID.", result[0], result[1]);
            return ResponseEntity.ok(ApiResponse.builder().success(true).message(message).build());
        } catch (IOException e) {
            return new ResponseEntity<>(ApiResponse.builder().success(false).message("Lỗi khi đọc file: " + e.getMessage()).build(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Tạo mới một điểm chuẩn")
    public ResponseEntity<ApiResponse> createScore(@Valid @RequestBody AdmissionScoreRequest request) {
        AdmissionScoreResponse response = admissionScoreService.createScore(request);
        return new ResponseEntity<>(ApiResponse.builder().success(true).message("Tạo điểm chuẩn thành công.").data(response).build(), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Cập nhật một điểm chuẩn")
    public ResponseEntity<ApiResponse> updateScore(@PathVariable Long id, @Valid @RequestBody AdmissionScoreRequest request) {
        AdmissionScoreResponse response = admissionScoreService.updateScore(id, request);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Cập nhật điểm chuẩn thành công.").data(response).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    @Operation(summary = "Xóa một điểm chuẩn")
    public ResponseEntity<ApiResponse> deleteScore(@PathVariable Long id) {
        admissionScoreService.deleteScore(id);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Xóa điểm chuẩn thành công.").build());
    }

    // ========== ENDPOINTS CÔNG KHAI (PUBLIC) ==========

    @GetMapping("/public/universities")
    @Operation(summary = "Lấy danh sách tất cả các trường đại học")
    public ResponseEntity<ApiResponse> getAllUniversities() {
        List<UniversityCode> universities = admissionScoreService.getAllUniversities();
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Lấy danh sách trường thành công.").data(universities).build());
    }

    @GetMapping("/public/filter")
    @Operation(summary = "Tra cứu, lọc điểm chuẩn")
    public ResponseEntity<ApiResponse> getScores(
            @Parameter(description = "Mã trường (lấy từ API /universities)") @RequestParam(required = false) UniversityCode universityCode,
            @Parameter(description = "Năm tuyển sinh") @RequestParam(required = false) Integer year,
            @Parameter(description = "Từ khóa tìm kiếm theo tên hoặc mã ngành") @RequestParam(required = false) String majorKeyword) {

        List<AdmissionScoreResponse> scores = admissionScoreService.getScores(universityCode, year, majorKeyword);
        return ResponseEntity.ok(ApiResponse.builder().success(true).message("Tra cứu điểm chuẩn thành công.").data(scores).build());
    }
}