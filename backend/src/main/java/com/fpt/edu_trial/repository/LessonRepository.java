package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    Page<Lesson> findByChapterId(Long chapterId, Pageable pageable);

    // Dùng để kiểm tra quyền sở hữu
    Optional<Lesson> findByIdAndChapter_TrialProgram_University_Id(Long lessonId, Long universityId);
}
