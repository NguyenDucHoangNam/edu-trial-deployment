package com.fpt.edu_trial.dto.response;


import com.fpt.edu_trial.enums.Gender; // Import enum Gender của bạn
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String firstName;
    private String lastName;
    private String avatar;
    private Gender gender;
    private String phone;
    private LocalDate dob;
    private String address;
    private String description;
    private String zipCode;
    private boolean enabled;
    private String role;
}
