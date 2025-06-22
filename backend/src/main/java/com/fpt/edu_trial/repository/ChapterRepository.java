package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Chapter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    Page<Chapter> findByTrialProgramId(Long trialProgramId, Pageable pageable);

    Optional<Chapter> findByIdAndTrialProgram_University_Id(Long chapterId, Long universityId);
}