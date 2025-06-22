package com.fpt.edu_trial.repository;


import com.fpt.edu_trial.entity.UniversityFacilities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniversityFacilitiesRepository extends JpaRepository<UniversityFacilities, Long> {
    List<UniversityFacilities> findByUniversityId(Long universityId);
}
