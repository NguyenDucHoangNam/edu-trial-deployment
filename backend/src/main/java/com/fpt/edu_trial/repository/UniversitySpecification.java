package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Major;
import com.fpt.edu_trial.entity.University;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class UniversitySpecification {

    /**
     * Tiêu chí: tìm theo tên trường HOẶC tên viết tắt.
     * Tìm kiếm không phân biệt chữ hoa/thường và tìm kiếm gần đúng (chứa ký tự).
     */
    public static Specification<University> byNameOrShortName(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(keyword)) {
                return null; // Không áp dụng tiêu chí nếu keyword rỗng
            }
            String likePattern = "%" + keyword.toLowerCase() + "%";

            // Tạo 2 điều kiện LIKE
            Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern);
            Predicate shortNameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("shortName")), likePattern);

            // Kết hợp chúng bằng OR
            return criteriaBuilder.or(nameLike, shortNameLike);
        };
    }

    /**
     * Tiêu chí: tìm trường có chứa ngành học với tên được chỉ định.
     * Tìm kiếm không phân biệt chữ hoa/thường và tìm kiếm gần đúng.
     */
    public static Specification<University> byMajorName(String majorName) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(majorName)) {
                return null; // Không áp dụng tiêu chí nếu majorName rỗng
            }
            // Tránh join nhiều lần gây lỗi
            query.distinct(true);

            // Thực hiện JOIN từ University sang Major
            Join<University, Major> majorJoin = root.join("Majors"); // "Majors" là tên thuộc tính List<Major> trong entity University

            // Điều kiện LIKE trên tên của ngành
            return criteriaBuilder.like(
                    criteriaBuilder.lower(majorJoin.get("name")),
                    "%" + majorName.toLowerCase() + "%"
            );
        };
    }
}