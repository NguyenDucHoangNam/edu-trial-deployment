package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Faculty;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    // Tìm tất cả các khoa thuộc về một trường, có phân trang
    Page<Faculty> findByUniversityId(Long universityId, Pageable pageable);
}