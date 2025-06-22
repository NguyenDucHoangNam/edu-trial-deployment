package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.AdmissionScoreRequest;
import com.fpt.edu_trial.dto.response.AdmissionScoreResponse;
import com.fpt.edu_trial.entity.AdmissionScore;
import com.fpt.edu_trial.enums.UniversityCode;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.repository.AdmissionScoreRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.CellType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdmissionScoreService {

    private final AdmissionScoreRepository admissionScoreRepository;
    // Giả sử bạn có một Mapper, nếu không có thể set thủ công
    // private final AdmissionScoreMapper admissionScoreMapper;

    // ========== CRUD cho Admin & Staff ==========
    @Transactional
    public int importScoresFromExcel(MultipartFile file, UniversityCode universityCode, Integer year) throws IOException {
        List<AdmissionScore> scoresToSave = new ArrayList<>();

        InputStream inputStream = file.getInputStream();
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        XSSFSheet sheet = workbook.getSheetAt(0);

        Iterator<Row> rowIterator = sheet.iterator();
        if (rowIterator.hasNext()) {
            rowIterator.next(); // Bỏ qua dòng tiêu đề đầu tiên
        }

        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();

            // Bỏ qua các dòng trống
            if(row.getCell(0) == null || row.getCell(0).getCellType() == CellType.BLANK) {
                continue;
            }

            try {
                AdmissionScore score = new AdmissionScore();

                // Set Mã trường và Năm từ tham số truyền vào, không đọc từ file
                score.setUniversityCode(universityCode);
                score.setYear(year);

                // BẮT ĐẦU ĐỌC DỮ LIỆU TỪ FILE EXCEL THEO CẤU TRÚC MỚI
                // Cột A (index 0) là STT -> Bỏ qua

                // Cột B (index 1) -> Mã ngành
                Cell majorCodeCell = row.getCell(1);
                score.setMajorCode(majorCodeCell != null ? majorCodeCell.getStringCellValue() : null);

                // Cột C (index 2) -> Tên ngành
                Cell majorNameCell = row.getCell(2);
                score.setMajorName(majorNameCell.getStringCellValue());

                // Cột D (index 3) -> Tổ hợp môn
                Cell combinationCell = row.getCell(3);
                score.setSubjectCombination(combinationCell.getStringCellValue());

                // Cột E (index 4) -> Điểm chuẩn
                Cell scoreCell = row.getCell(4);
                score.setScore((float) scoreCell.getNumericCellValue());

                // Cột Ghi chú (nếu có)
                Cell noteCell = row.getCell(5); // Giả sử Ghi chú ở cột F (index 5)
                if(noteCell != null){
                    score.setNote(noteCell.getStringCellValue());
                }

                scoresToSave.add(score);
            } catch (Exception e) {
                log.error("Lỗi khi đọc dòng Excel số {}: {}", row.getRowNum() + 1, e.getMessage());
            }
        }

        workbook.close();
        admissionScoreRepository.saveAll(scoresToSave);

        log.info("Đã lưu {} bản ghi từ file Excel.", scoresToSave.size());
        return scoresToSave.size();
    }

    @Transactional
    public int[] updateScoresFromExcel(MultipartFile file) throws IOException {
        List<AdmissionScore> scoresToUpdate = new ArrayList<>();
        int updatedCount = 0;
        int skippedCount = 0;

        InputStream inputStream = file.getInputStream();
        XSSFWorkbook workbook = new XSSFWorkbook(inputStream);
        XSSFSheet sheet = workbook.getSheetAt(0);

        // B1: Đọc tất cả ID từ file Excel và lưu vào một List
        List<Long> idsFromFile = new ArrayList<>();
        Iterator<Row> rowIdIterator = sheet.iterator();
        if (rowIdIterator.hasNext()) {
            rowIdIterator.next(); // Bỏ qua dòng tiêu đề
        }
        while (rowIdIterator.hasNext()) {
            Row row = rowIdIterator.next();
            if (row.getCell(0) != null && row.getCell(0).getCellType() == CellType.NUMERIC) {
                idsFromFile.add((long) row.getCell(0).getNumericCellValue());
            }
        }

        // B2: Truy vấn database MỘT LẦN DUY NHẤT để lấy về các bản ghi có ID tương ứng
        // Chuyển kết quả thành một Map<ID, AdmissionScore> để dễ dàng truy cập
        Map<Long, AdmissionScore> scoresFromDbMap = admissionScoreRepository.findAllById(idsFromFile).stream()
                .collect(Collectors.toMap(AdmissionScore::getId, Function.identity()));

        // B3: Lặp lại qua file Excel để thực hiện cập nhật
        Iterator<Row> rowDataIterator = sheet.iterator();
        if (rowDataIterator.hasNext()) {
            rowDataIterator.next(); // Bỏ qua dòng tiêu đề
        }
        while (rowDataIterator.hasNext()) {
            Row row = rowDataIterator.next();
            Cell idCell = row.getCell(0);
            if (idCell == null || idCell.getCellType() != CellType.NUMERIC) {
                continue; // Bỏ qua dòng nếu không có ID
            }

            long currentId = (long) idCell.getNumericCellValue();
            AdmissionScore scoreToUpdate = scoresFromDbMap.get(currentId);

            // Nếu tìm thấy bản ghi trong Map (tức là có trong DB) thì tiến hành cập nhật
            if (scoreToUpdate != null) {
                try {
                    // Cập nhật các trường từ file Excel, ô nào null thì bỏ qua
                    Cell majorCodeCell = row.getCell(1);
                    if (majorCodeCell != null) scoreToUpdate.setMajorCode(majorCodeCell.getStringCellValue());

                    Cell majorNameCell = row.getCell(2);
                    if (majorNameCell != null) scoreToUpdate.setMajorName(majorNameCell.getStringCellValue());

                    Cell combinationCell = row.getCell(3);
                    if (combinationCell != null) scoreToUpdate.setSubjectCombination(combinationCell.getStringCellValue());

                    Cell scoreCell = row.getCell(4);
                    if (scoreCell != null) scoreToUpdate.setScore((float) scoreCell.getNumericCellValue());

                    Cell noteCell = row.getCell(5);
                    if (noteCell != null) scoreToUpdate.setNote(noteCell.getStringCellValue());

                    scoresToUpdate.add(scoreToUpdate);
                    updatedCount++;
                } catch (Exception e) {
                    log.error("Lỗi dữ liệu không hợp lệ ở dòng {}: {}", row.getRowNum() + 1, e.getMessage());
                    skippedCount++;
                }
            } else {
                // Nếu không tìm thấy ID trong Map, ghi log và bỏ qua
                log.warn("Không tìm thấy điểm chuẩn với ID {} để cập nhật. Bỏ qua dòng {}.", currentId, row.getRowNum() + 1);
                skippedCount++;
            }
        }

        workbook.close();

        // Lưu tất cả các bản ghi đã được cập nhật
        if (!scoresToUpdate.isEmpty()) {
            admissionScoreRepository.saveAll(scoresToUpdate);
        }

        return new int[]{updatedCount, skippedCount};
    }
    @Transactional
    public AdmissionScoreResponse createScore(AdmissionScoreRequest request) {
        AdmissionScore score = new AdmissionScore();
        // Cập nhật thủ công hoặc dùng mapper
        updateEntityFromRequest(score, request);
        AdmissionScore savedScore = admissionScoreRepository.save(score);
        log.info("Đã tạo điểm chuẩn mới với ID: {}", savedScore.getId());
        return toResponse(savedScore);
    }

    @Transactional
    public AdmissionScoreResponse updateScore(Long id, AdmissionScoreRequest request) {
        AdmissionScore score = admissionScoreRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy điểm chuẩn với ID: " + id));
        updateEntityFromRequest(score, request);
        AdmissionScore updatedScore = admissionScoreRepository.save(score);
        log.info("Đã cập nhật điểm chuẩn với ID: {}", updatedScore.getId());
        return toResponse(updatedScore);
    }

    @Transactional
    public void deleteScore(Long id) {
        if (!admissionScoreRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy điểm chuẩn với ID: " + id);
        }
        admissionScoreRepository.deleteById(id);
        log.info("Đã xóa điểm chuẩn với ID: {}", id);
    }

    // ========== Public APIs ==========

    /**
     * Lấy danh sách điểm chuẩn đã được lọc
     */
    @Transactional(readOnly = true)
    public List<AdmissionScoreResponse> getScores(UniversityCode universityCode, Integer year, String majorKeyword) {
        Specification<AdmissionScore> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (universityCode != null) {
                predicates.add(cb.equal(root.get("universityCode"), universityCode));
            }
            if (year != null) {
                predicates.add(cb.equal(root.get("year"), year));
            }
            if (majorKeyword != null && !majorKeyword.isBlank()) {
                String pattern = "%" + majorKeyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("majorName")), pattern),
                        cb.like(cb.lower(root.get("majorCode")), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<AdmissionScore> results = admissionScoreRepository.findAll(spec);
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tất cả các trường đại học từ Enum
     */
    public List<UniversityCode> getAllUniversities() {
        return Arrays.asList(UniversityCode.values());
    }

    // ========== Hàm tiện ích ==========

    private void updateEntityFromRequest(AdmissionScore score, AdmissionScoreRequest request) {
        score.setUniversityCode(request.getUniversityCode());
        score.setYear(request.getYear());
        score.setMajorName(request.getMajorName());
        score.setMajorCode(request.getMajorCode());
        score.setSubjectCombination(request.getSubjectCombination());
        score.setScore(request.getScore());
        score.setNote(request.getNote());
    }

    private AdmissionScoreResponse toResponse(AdmissionScore score) {
        AdmissionScoreResponse response = new AdmissionScoreResponse();
        response.setId(score.getId());
        response.setUniversityCode(score.getUniversityCode());
        response.setUniversityName(score.getUniversityCode().getUniversityName());
        response.setYear(score.getYear());
        response.setMajorName(score.getMajorName());
        response.setMajorCode(score.getMajorCode());
        response.setSubjectCombination(score.getSubjectCombination());
        response.setScore(score.getScore());
        response.setNote(score.getNote());
        response.setCreatedAt(score.getCreatedAt());
        return response;
    }
}