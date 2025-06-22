package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Major;
import com.fpt.edu_trial.entity.TrialProgram;
import com.fpt.edu_trial.entity.University;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class TrialProgramSpecification {

    // Tiêu chí: tìm theo tên khóa học thử
    public static Specification<TrialProgram> byProgramName(String programName) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(programName)) return null;
            return cb.like(cb.lower(root.get("name")), "%" + programName.toLowerCase() + "%");
        };
    }

    // Tiêu chí: tìm theo tên trường đại học
    public static Specification<TrialProgram> byUniversityName(String universityName) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(universityName)) return null;
            Join<TrialProgram, University> universityJoin = root.join("university");
            return cb.like(cb.lower(universityJoin.get("name")), "%" + universityName.toLowerCase() + "%");
        };
    }

    // Tiêu chí: tìm theo tên ngành học
    public static Specification<TrialProgram> byMajorName(String majorName) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(majorName)) return null;
            query.distinct(true); // Đảm bảo không có kết quả trùng lặp
            Join<TrialProgram, University> universityJoin = root.join("university");
            Join<University, Major> majorJoin = universityJoin.join("Majors"); // "Majors" là tên thuộc tính Set<Major> trong entity University
            return cb.like(cb.lower(majorJoin.get("name")), "%" + majorName.toLowerCase() + "%");
        };
    }
}
