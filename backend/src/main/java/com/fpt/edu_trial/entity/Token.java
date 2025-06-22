package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "tbl_refresh_tokens") // Đổi tên bảng nếu muốn
public class Token extends AbstractEntity<Integer> { // ID có thể là Long hoặc Integer

    // Liên kết với User entity để dễ dàng truy vấn token của user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "token_value", nullable = false, unique = true, columnDefinition = "TEXT")
    String tokenValue; // Giá trị của refresh token

    @Column(name = "expiry_date", nullable = false)
    Instant expiryDate;

    @Column(name = "revoked", nullable = false)
    boolean revoked = false;
}