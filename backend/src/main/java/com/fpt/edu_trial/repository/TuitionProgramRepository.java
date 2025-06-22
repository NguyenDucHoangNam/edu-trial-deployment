package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.TuitionPrograms;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TuitionProgramRepository extends JpaRepository<TuitionPrograms, Long> {
    List<TuitionPrograms> findByUniversityId(Long universityId);
    Page<TuitionPrograms> findByUniversityId(Long universityId, Pageable pageable);
    Optional<TuitionPrograms> findByIdAndUniversityId(Long id, Long universityId);
    // Optional<TuitionPrograms> findByProgramNameAndUniversityId(String programName, Long universityId); // Nếu cần kiểm tra tên duy nhất
}
