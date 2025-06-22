package com.fpt.edu_trial.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PredefinedRole {
    USER("USER", "Quyền hạn cho người dùng thông thường (học sinh)."),
    UNIVERSITY("UNIVERSITY", "Quyền hạn cho đại diện trường đại học."),
    STAFF("STAFF", "Quyền hạn cho nhân viên quản lý hệ thống."),
    ADMIN("ADMIN", "Quyền hạn cao nhất, quản trị toàn bộ hệ thống.");

    private final String roleName;
    private final String description;
}
