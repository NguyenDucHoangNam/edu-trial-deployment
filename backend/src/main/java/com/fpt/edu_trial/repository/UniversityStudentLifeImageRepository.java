package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.UniversityStudentLifeImages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UniversityStudentLifeImageRepository extends JpaRepository<UniversityStudentLifeImages, Long> {
    Optional<UniversityStudentLifeImages> findByIdAndUniversityId(Long id, Long universityId);

    Page<UniversityStudentLifeImages> findByUniversityId(Long universityId, Pageable pageable);
}