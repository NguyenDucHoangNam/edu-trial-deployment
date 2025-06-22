package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UniversityRepository extends JpaRepository<University, Long>, JpaSpecificationExecutor<University> {
    Optional<University> findByName(String name);
    Optional<University> findByShortName(String shortName);
    Optional<University> findByUserId(Long userId);

    @Query("SELECT u FROM University u " +
            "LEFT JOIN FETCH u.faculties f " +
            "LEFT JOIN FETCH f.majors " + // Join tiếp từ faculties sang majors
            "LEFT JOIN FETCH u.scholarshipPrograms " +
            "LEFT JOIN FETCH u.tuitionPrograms " +
            "LEFT JOIN FETCH u.universityEvents " +
            "LEFT JOIN FETCH u.universityFacilities " +
            "LEFT JOIN FETCH u.universityStudentLifeImages " +
            "LEFT JOIN FETCH u.trialPrograms " + // <-- THÊM DÒNG NÀY
            "WHERE u.id = :id")
    Optional<University> findDetailById(@Param("id") Long id);
}

