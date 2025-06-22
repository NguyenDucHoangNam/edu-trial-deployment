package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

// SỬA ĐỔI: Thêm các import cần thiết
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "universities")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class University extends AbstractEntity<Long> {

    @Column(nullable = false)
    String name;

    @Column(name = "short_name")
    String shortName;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    String logoUrl;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    String coverImageUrl;

    String email;

    String phone;

    String website;

    String address;

    String slogan;

    @Column(columnDefinition = "TEXT")
    String introduction;

    @Column(columnDefinition = "TEXT")
    String highlight;

    @Column(name = "video_intro_url", columnDefinition = "TEXT")
    String videoIntroUrl;

    @Column(name = "google_map_embed_url", columnDefinition = "TEXT")
    String googleMapEmbedUrl;

    Boolean active;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // SỬA ĐỔI: Chuyển tất cả List thành Set và ArrayList thành HashSet
    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL)
    Set<UniversityStudentLifeImages> universityStudentLifeImages = new HashSet<>();

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL)
    Set<UniversityFacilities> universityFacilities = new HashSet<>();

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL)
    Set<ScholarshipPrograms> scholarshipPrograms = new HashSet<>();

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL)
    Set<TuitionPrograms> tuitionPrograms = new HashSet<>();

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Faculty> faculties = new HashSet<>();

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Major> Majors = new HashSet<>();

    @OneToMany(mappedBy = "university", fetch = FetchType.LAZY)
    Set<UniversityEvent> universityEvents = new HashSet<>();

    @OneToMany(mappedBy = "university", fetch = FetchType.LAZY)
    Set<TrialProgram> trialPrograms = new HashSet<>();

    @OneToMany(mappedBy = "university", fetch = FetchType.LAZY)
    Set<Advertisement> advertisements = new HashSet<>();
}