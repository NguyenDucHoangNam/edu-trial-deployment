package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.DocumentCreateRequest;
import com.fpt.edu_trial.dto.request.DocumentUpdateRequest;
import com.fpt.edu_trial.dto.response.DocumentResponse;
import com.fpt.edu_trial.entity.NationalExamDocument;
import com.fpt.edu_trial.enums.DocumentSubject;
import com.fpt.edu_trial.enums.DocumentType;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.DocumentMapper;
import com.fpt.edu_trial.repository.NationalExamDocumentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final NationalExamDocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final CloudinaryUploadService cloudinaryUploadService;

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getAllDocuments(Pageable pageable) {
        log.info("Lấy tất cả tài liệu với thông tin phân trang: {}", pageable);

        // Dùng phương thức findAll có sẵn của JpaRepository để lấy dữ liệu và phân trang
        // .map() được dùng để chuyển đổi từ Page<NationalExamDocument> sang Page<DocumentResponse>
        return documentRepository.findAll(pageable)
                .map(documentMapper::toDocumentResponse);
    }
    @Transactional(readOnly = true)
    public Map<Integer, List<DocumentResponse>> getFilteredAndGroupedDocuments(Integer year, DocumentSubject subject, DocumentType type) {
        log.info("Lọc tài liệu với các tham số - Năm: {}, Môn: {}, Loại: {}", year, subject, type);

        // 1. Sử dụng Specification để xây dựng câu truy vấn động
        Specification<NationalExamDocument> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Chỉ thêm điều kiện vào câu lệnh WHERE nếu tham số được cung cấp (khác null)
            if (year != null) {
                predicates.add(criteriaBuilder.equal(root.get("year"), year));
            }
            if (subject != null) {
                predicates.add(criteriaBuilder.equal(root.get("subject"), subject));
            }
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }

            // Kết hợp các điều kiện bằng mệnh đề AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        // 2. Sắp xếp kết quả: năm mới nhất lên đầu, sau đó là ngày tạo mới nhất
        Sort sort = Sort.by(Sort.Direction.DESC, "year").and(Sort.by(Sort.Direction.DESC, "createdAt"));

        // 3. Thực thi truy vấn với các điều kiện lọc và sắp xếp
        List<NationalExamDocument> documents = documentRepository.findAll(spec, sort);

        // 4. Chuyển đổi Entity sang DTO và nhóm theo năm
        return documents.stream()
                .map(documentMapper::toDocumentResponse)
                .collect(Collectors.groupingBy(
                        DocumentResponse::getYear,
                        LinkedHashMap::new, // Giữ thứ tự các năm đã sắp xếp
                        Collectors.toList()
                ));
    }


    /**
     * Hàm filter cũ, đã cập nhật để bỏ keyword
     */
    @Transactional(readOnly = true)
    public Page<DocumentResponse> filterDocuments(Integer year, DocumentSubject subject, DocumentType type, Pageable pageable) {
        Specification<NationalExamDocument> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Bỏ điều kiện lọc theo keyword

            if (year != null) {
                predicates.add(cb.equal(root.get("year"), year));
            }
            if (subject != null) {
                predicates.add(cb.equal(root.get("subject"), subject));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return documentRepository.findAll(spec, pageable)
                .map(documentMapper::toDocumentResponse);
    }


    @Transactional
    public DocumentResponse createDocument(DocumentCreateRequest request) {
        MultipartFile file = request.getDocumentFile();
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.MISSING_REQUEST_PART, "File tài liệu là bắt buộc.");
        }

        log.info("Bắt đầu tải lên tài liệu: {}", file.getOriginalFilename());
        String fileUrl = cloudinaryUploadService.uploadFile(file, "national_exam_documents");

        NationalExamDocument document = NationalExamDocument.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .year(request.getYear())
                .subject(request.getSubject())
                .type(request.getType())
                .fileUrl(fileUrl)
                .fileSize(formatFileSize(file.getSize()))
                .build();

        NationalExamDocument savedDocument = documentRepository.save(document);
        log.info("Tạo tài liệu thành công với ID: {}", savedDocument.getId());
        return documentMapper.toDocumentResponse(savedDocument);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> filterDocuments(String keyword, DocumentSubject subject, Integer year, DocumentType type, Pageable pageable) {
        Specification<NationalExamDocument> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%"));
            }
            if (subject != null) {
                predicates.add(cb.equal(root.get("subject"), subject));
            }
            if (year != null) {
                predicates.add(cb.equal(root.get("year"), year));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return documentRepository.findAll(spec, pageable)
                .map(documentMapper::toDocumentResponse);
    }

    // (Bạn có thể tự thêm các hàm update, delete, getById nếu cần)

    @Transactional
    public DocumentResponse updateDocument(Long documentId, DocumentUpdateRequest request) {
        NationalExamDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài liệu với ID: " + documentId));

        boolean isModified = false;

        // Cập nhật các trường metadata nếu được cung cấp
        if (StringUtils.hasText(request.getTitle())) {
            document.setTitle(request.getTitle());
            isModified = true;
        }
        if (request.getDescription() != null) {
            document.setDescription(request.getDescription());
            isModified = true;
        }
        if (request.getYear() != null) {
            document.setYear(request.getYear());
            isModified = true;
        }
        if (request.getSubject() != null) {
            document.setSubject(request.getSubject());
            isModified = true;
        }
        if (request.getType() != null) {
            document.setType(request.getType());
            isModified = true;
        }

        // Xử lý nếu có file mới được tải lên để thay thế
        MultipartFile newFile = request.getDocumentFile();
        if (newFile != null && !newFile.isEmpty()) {
            log.info("Bắt đầu thay thế file cho tài liệu ID: {}", documentId);
            // Xóa file cũ trên Cloudinary
            deleteFileFromCloudinary(document.getFileUrl());

            // Tải file mới lên
            String newFileUrl = cloudinaryUploadService.uploadFile(newFile, "national_exam_documents");
            document.setFileUrl(newFileUrl);
            document.setFileSize(formatFileSize(newFile.getSize()));
            isModified = true;
        }

        if (isModified) {
            NationalExamDocument updatedDocument = documentRepository.save(document);
            log.info("Cập nhật tài liệu ID: {} thành công.", documentId);
            return documentMapper.toDocumentResponse(updatedDocument);
        }

        // Trả về trạng thái hiện tại nếu không có gì thay đổi
        return documentMapper.toDocumentResponse(document);
    }

    /**
     * HÀM MỚI: Xóa tài liệu
     */
    @Transactional
    public void deleteDocument(Long documentId) {
        NationalExamDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy tài liệu với ID: " + documentId));

        log.info("Bắt đầu xóa tài liệu ID: {}", documentId);

        // Xóa file trên Cloudinary trước
        deleteFileFromCloudinary(document.getFileUrl());

        // Xóa bản ghi trong database
        documentRepository.delete(document);
        log.info("Xóa tài liệu ID: {} thành công.", documentId);
    }

    private String formatFileSize(long size) {
        if (size <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(size) / Math.log10(1024));
        return new DecimalFormat("#,##0.#").format(size / Math.pow(1024, digitGroups)) + " " + units[digitGroups];
    }

    private void deleteFileFromCloudinary(String fileUrl) {
        if (StringUtils.hasText(fileUrl)) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(fileUrl);
            cloudinaryUploadService.deleteFileByPublicId(publicId);
        }
    }


}