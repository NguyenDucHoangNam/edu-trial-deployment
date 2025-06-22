package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Major;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {

    // SỬA ĐỔI: Thay thế MajorName bằng String trong các phương thức truy vấn
    /**
     * Tìm một ngành theo tên và ID của khoa.
     * Dùng để kiểm tra tên ngành có bị trùng trong một khoa cụ thể hay không.
     */
    Optional<Major> findByNameAndFacultyId(String name, Long facultyId);

    /**
     * Tìm các ngành theo ID của khoa, trả về một List.
     */
    List<Major> findByFacultyId(Long facultyId);

    /**
     * Tìm các ngành theo ID của khoa, có phân trang.
     */
    Page<Major> findByFacultyId(Long facultyId, Pageable pageable);

    /**
     * Đếm số lượng ngành trong một khoa.
     */
    long countByFacultyId(Long facultyId);

    // Không cần phương thức findByName(MajorName name) nữa vì tên ngành chỉ duy nhất trong phạm vi một khoa.
}
