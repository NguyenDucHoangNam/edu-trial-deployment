package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.ScholarshipPrograms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScholarshipProgramRepository extends JpaRepository<ScholarshipPrograms, Long> {
    List<ScholarshipPrograms> findByUniversityId(Long universityId);
    Page<ScholarshipPrograms> findByUniversityId(Long universityId, Pageable pageable);
    Optional<ScholarshipPrograms> findByIdAndUniversityId(Long id, Long universityId);
    // Optional<ScholarshipPrograms> findByNameAndUniversityId(String name, Long universityId); // Nếu cần kiểm tra tên duy nhất trong trường
}
