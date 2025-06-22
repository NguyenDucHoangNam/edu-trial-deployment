package com.fpt.edu_trial.entity;

import java.util.Date;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "invalidatedTokens")
public class InvalidatedToken {

    @Id
    String id;

    @Column(name = "expiry_time", nullable = false)
    Date expiryTime;

}
