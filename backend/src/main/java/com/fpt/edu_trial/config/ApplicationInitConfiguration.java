package com.fpt.edu_trial.config;

import com.fpt.edu_trial.enums.PredefinedRole;
import com.fpt.edu_trial.entity.Role;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.enums.Gender;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.repository.RoleRepository;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
// import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty; // TẠM THỜI COMMENT DÒNG NÀY
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Optional;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfiguration {

    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${app.admin.email:admin@edutrial.local}")
    String ADMIN_EMAIL;

    @NonFinal
    @Value("${app.admin.password:123456}")
    String ADMIN_PASSWORD;

    @NonFinal
    @Value("${app.admin.firstName:Super}")
    String ADMIN_FIRST_NAME;

    @NonFinal
    @Value("${app.admin.lastName:Admin}")
    String ADMIN_LAST_NAME;

    @Bean
    @Order(1)
    @Transactional
    public ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        log.info("============================================================");
        log.info("EXECUTING ApplicationInitConfiguration.applicationRunner");
        log.info("============================================================");

        return args -> {
            log.info("ApplicationInitConfiguration: Lambda execution started.");
            
            Role roleUser = createRoleIfNotExists(roleRepository, PredefinedRole.USER);
            Role roleUniversity = createRoleIfNotExists(roleRepository, PredefinedRole.UNIVERSITY);
            Role roleStaff = createRoleIfNotExists(roleRepository, PredefinedRole.STAFF);
            Role roleAdmin = createRoleIfNotExists(roleRepository, PredefinedRole.ADMIN);

            if (roleUser == null || roleAdmin == null || roleStaff == null || roleUniversity == null) {
                log.error("CRITICAL: One or more core roles could not be created/found. Aborting user initialization.");
                return;
            }

            // 2. Khởi tạo tài khoản Admin
            createUserIfNotExists(userRepository,
                    ADMIN_EMAIL,
                    ADMIN_PASSWORD,
                    ADMIN_FIRST_NAME,
                    ADMIN_LAST_NAME,
                    ADMIN_FIRST_NAME + " " + ADMIN_LAST_NAME,
                    roleAdmin,
                    true);

            createUserIfNotExists(userRepository, "staff.local@edutrial.com", "Staff@123", "Staff", "Demo", "Staff Demo", roleStaff, true);
            createUserIfNotExists(userRepository, "university.local@edutrial.com", "University@123", "University", "Demo", "University Demo", roleUniversity, true);
            createUserIfNotExists(userRepository, "university.local2@edutrial.com", "University2@123", "University2", "Demo2", "University Demo2", roleUniversity, true);
            createUserIfNotExists(userRepository, "user.local@edutrial.com", "User@123", "User", "Demo", "User Demo", roleUser, true);

            log.info("Application data initialization completed successfully.");
        };
    }

    private Role createRoleIfNotExists(RoleRepository roleRepository, PredefinedRole predefinedRole) {
        log.info("Attempting to create or find role: {}", predefinedRole.getRoleName());
        Optional<Role> existingRole = roleRepository.findByName(predefinedRole.getRoleName());
        if (existingRole.isPresent()) {
            log.info("Vai trò '{}' đã tồn tại.", predefinedRole.getRoleName());
            return existingRole.get();
        } else {
            Role newRole = Role.builder()
                    .name(predefinedRole.getRoleName())
                    .description(predefinedRole.getDescription())
                    .permissions(new HashSet<>())
                    .build();
            try {
                Role savedRole = roleRepository.save(newRole);
                log.info("Đã tạo vai trò mới: '{}' với ID: {}", predefinedRole.getRoleName(), savedRole.getId());
                return savedRole;
            } catch (DataIntegrityViolationException e) {
                log.warn("DataIntegrityViolationException khi tạo vai trò '{}'. Thử tải lại...", predefinedRole.getRoleName(), e);
                return roleRepository.findByName(predefinedRole.getRoleName())
                        .orElseGet(() -> {
                            log.error("CRITICAL: Không thể tạo hoặc tìm thấy vai trò '{}' sau khi thử lại.", predefinedRole.getRoleName());
                            return null;
                        });
            } catch (Exception e) {
                log.error("Lỗi không mong muốn khi tạo vai trò '{}'", predefinedRole.getRoleName(), e);
                return null;
            }
        }
    }

    private void createUserIfNotExists(UserRepository userRepository, String email, String rawPassword, String firstName, String lastName, String name, Role role, boolean enabled) {
        if (role == null) {
            log.error("Không thể tạo người dùng '{}' vì vai trò là null.", email);
            return;
        }
        if (userRepository.findByEmail(email).isPresent()) {
            log.info("Người dùng với email '{}' đã tồn tại.", email);
        } else {
            User newUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .firstName(firstName)
                    .lastName(lastName)
                    .name(name)
                    .role(role)
                    .enabled(enabled)
                    .gender(Gender.MALE)
                    .dob(LocalDate.now().minusYears(20))
                    .build();
            try {
                userRepository.save(newUser);
                log.info("Đã tạo người dùng mới: '{}' với vai trò '{}'", email, role.getName());
            } catch (DataIntegrityViolationException e) {
                log.warn("DataIntegrityViolationException khi tạo người dùng '{}'. Bỏ qua...", email, e);
            } catch (Exception e) {
                log.error("Lỗi không mong muốn khi tạo người dùng '{}'", email, e);
            }
        }
    }
}
