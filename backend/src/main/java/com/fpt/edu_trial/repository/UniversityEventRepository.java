package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.UniversityEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityEventRepository extends JpaRepository<UniversityEvent, Long> {

    // Lấy danh sách sự kiện của một trường (có phân trang)
    Page<UniversityEvent> findByUniversityId(Long universityId, Pageable pageable);

    // Lấy một sự kiện cụ thể theo ID và ID của trường (để kiểm tra quyền sở hữu)
    Optional<UniversityEvent> findByIdAndUniversityId(Long id, Long universityId);
}