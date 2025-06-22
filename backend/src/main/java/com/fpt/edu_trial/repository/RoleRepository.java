package com.fpt.edu_trial.repository;


import com.fpt.edu_trial.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Annotation này đánh dấu đây là một Spring Data repository
public interface RoleRepository extends JpaRepository<Role, Long> { // Role là entity, Long là kiểu dữ liệu của ID trong Role

    Optional<Role> findByName(String name);

}
