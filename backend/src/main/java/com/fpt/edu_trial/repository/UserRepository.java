package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmailAndEnabledIsTrue(String email);
    boolean existsByEmailAndEnabledIsFalse(String email);


}