package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.NationalExamDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NationalExamDocumentRepository extends JpaRepository<NationalExamDocument, Long>, JpaSpecificationExecutor<NationalExamDocument> {
}
