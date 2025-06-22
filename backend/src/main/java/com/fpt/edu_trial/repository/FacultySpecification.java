package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.Faculty;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class FacultySpecification {

    /**
     * Tạo một Specification để tìm khoa có tên chứa một chuỗi ký tự.
     * Tìm kiếm không phân biệt chữ hoa/thường.
     * @param searchTerm từ khóa tìm kiếm
     * @return Specification<Faculty>
     */
    public static Specification<Faculty> nameContains(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            // Nếu searchTerm rỗng hoặc null, không áp dụng điều kiện lọc
            if (!StringUtils.hasText(searchTerm)) {
                return null;
            }
            // Tương đương với: WHERE lower(faculty.name) LIKE lower('%' + searchTerm + '%')
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), // Lấy trường 'name' và chuyển thành chữ thường
                    "%" + searchTerm.toLowerCase() + "%" // Thêm ký tự '%' để tìm kiếm gần đúng
            );
        };
    }
}