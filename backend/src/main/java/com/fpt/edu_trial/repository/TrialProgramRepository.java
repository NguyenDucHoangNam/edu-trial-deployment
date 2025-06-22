package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.TrialProgram;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrialProgramRepository extends JpaRepository<TrialProgram, Long>, JpaSpecificationExecutor<TrialProgram> {

    // Tìm các chương trình theo ID trường, có phân trang
    Page<TrialProgram> findByUniversityId(Long universityId, Pageable pageable);

    // Tìm một chương trình cụ thể theo ID và ID trường (để kiểm tra quyền sở hữu)
    Optional<TrialProgram> findByIdAndUniversityId(Long id, Long universityId);
}
