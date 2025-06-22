// File: types/MajorDetail.ts (Giữ nguyên như phác thảo trước)

export interface FacultyMember { /* ... */ }
export interface IndustryPartner { /* ... */ }
export interface AlumniHighlight { /* ... */ }
export interface MajorTrialCourse {
    id: string;
    name: string;
    description: string;
    duration: string;
    thumbnailUrl?: string;
    // Thêm trường schoolSlug vào đây để dễ dàng tạo link học thử
    schoolSlug: string;
}

export interface MajorFAQ { /* ... */ }

export interface MajorDetail {
  id: string;
  slug: string;
  name: string;
  university: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string;
    // Thêm các thông tin khác của trường nếu cần, ví dụ tuitionFees, scholarships
    tuitionFees?: { detailsLink?: string };
    scholarships?: { detailsLink?: string };
  };
  facultyName: string;
  bannerImageUrl?: string;
  videoIntroUrl?: string;
  introduction: string;
  whyThisMajor?: string;
  learningOutcomes?: string[];
  studyDuration: string;
  curriculumOverview?: string;
  majorSubjects?: string[];
  specializations?: string[];
  teachingMethodology?: string;
  internshipInfo?: string;
  careerPaths?: string[];
  industryOutlook?: string;
  salaryRange?: string;
  admissionRequirements?: string;
  tuitionFeeInfo?: string;
  scholarshipInfo?: string;
  admissionLink?: string;
  relevantFacilities?: string[];
  keyFacultyMembers?: FacultyMember[];
  industryPartnerships?: IndustryPartner[];
  researchHighlights?: string[];
  alumniSuccessStories?: AlumniHighlight[];
  relevantStudentActivities?: string[];
  trialCourses: MajorTrialCourse[]; // Danh sách khóa học thử của ngành này
  faq?: MajorFAQ[];
  contactInfo?: {
    phone?: string;
    email?: string;
    facebook?: string;
    website?: string;
  }
}

// Dữ liệu mẫu cho 1 ngành cụ thể (ví dụ: Công nghệ Thông tin tại FPT)
export const mockMajorDetail_IT_FPT: MajorDetail = {
    id: 'it-fpt',
    slug: 'cong-nghe-thong-tin',
    name: 'Công nghệ Thông tin',
    university: {
      id: 'FPTQN',
      slug: 'dai-hoc-fpt',
      name: 'Trường Đại Học FPT',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Logo_FPT_Education.png',
      // Thêm link chi tiết học phí/học bổng từ mockSchoolDetails ban đầu nếu muốn dùng
      tuitionFees: { detailsLink: '#' }, // Ví dụ
      scholarships: { detailsLink: '#' }, // Ví dụ
    },
    facultyName: 'Khoa Công nghệ Thông tin',
    bannerImageUrl: 'https://placehold.co/1200x400/3498db/ffffff?text=Banner+Cong+Nghe+Thong+Tin',
    videoIntroUrl: 'https://www.youtube.com/embed/your-video-id', // Thay bằng ID video thật

    introduction: 'Ngành Công nghệ Thông tin (CNTT) tại Đại học FPT đào tạo chuyên sâu về các lĩnh vực cốt lõi như Kỹ thuật Phần mềm, An toàn Thông tin, Trí tuệ Nhân tạo và Hệ thống Thông tin. Chương trình học được thiết kế theo chuẩn quốc tế, bám sát thực tế công nghiệp, giúp sinh viên nắm vững kiến thức chuyên môn và kỹ năng thực tế để làm việc trong môi trường công nghệ đầy biến động.',
    whyThisMajor: 'CNTT là ngành mũi nhọn trong kỷ nguyên số, mang lại cơ hội việc làm rộng mở với mức lương hấp dẫn. Học CNTT tại FPT, bạn được tiếp cận công nghệ mới nhất, học tập trong môi trường sáng tạo, có cơ hội thực tập và làm việc tại các tập đoàn công nghệ hàng đầu.',
    learningOutcomes: [ /* ... */ ], // Bổ sung chi tiết
    studyDuration: '4 năm (9 học kỳ chuyên ngành + 1 học kỳ OJT)',
    curriculumOverview: 'Chương trình học kết hợp chặt chẽ lý thuyết và thực hành...',
    majorSubjects: [ /* ... */ ], // Bổ sung chi tiết
    specializations: [ /* ... */ ], // Bổ sung chi tiết
    teachingMethodology: 'Áp dụng phương pháp Blended Learning...',
    internshipInfo: '100% sinh viên có cơ hội thực tập...',
    careerPaths: [ /* ... */ ], // Bổ sung chi tiết
    industryOutlook: 'Nhu cầu nhân lực CNTT luôn ở mức cao...',
    salaryRange: 'Mức lương khởi điểm cạnh tranh...',
    admissionRequirements: 'Xét tuyển dựa trên kết quả thi...',
    tuitionFeeInfo: 'Học phí tham khảo: ~28.700.000 VNĐ/học kỳ...',
    scholarshipInfo: 'Nhiều loại học bổng hấp dẫn...',
    admissionLink: 'https://daihoc.fpt.edu.vn/tuyen-sinh/',

    relevantFacilities: [ /* ... */ ], // Bổ sung chi tiết
    keyFacultyMembers: [ /* ... */ ], // Bổ sung chi tiết
    industryPartnerships: [ /* ... */ ], // Bổ sung chi tiết
    researchHighlights: [ /* ... */ ], // Bổ sung chi tiết
    alumniSuccessStories: [ /* ... */ ], // Bổ sung chi tiết
    relevantStudentActivities: [ /* ... */ ], // Bổ sung chi tiết

    trialCourses: [ // Các khóa học thử chỉ của ngành CNTT
      { id: 'tc1', name: 'Nhập môn Trí tuệ Nhân tạo (AI)', description: 'Khám phá những khái niệm cơ bản...', duration: '2 giờ', thumbnailUrl: 'https://placehold.co/400x250/3498db/ffffff?text=Khóa+AI&font=roboto', schoolSlug: 'dai-hoc-fpt' },
      { id: 'tc4', name: 'Lập trình Python cơ bản', description: 'Học ngôn ngữ lập trình phổ biến nhất...', duration: '3 giờ', thumbnailUrl: 'https://placehold.co/400x250/ffc107/ffffff?text=Khóa+Python&font=roboto', schoolSlug: 'dai-hoc-fpt' },
       { id: 'tc5', name: 'Giới thiệu về An toàn Thông tin', description: 'Tìm hiểu các mối đe dọa bảo mật...', duration: '1.5 giờ', thumbnailUrl: 'https://placehold.co/400x250/dc3545/ffffff?text=Khóa+Security&font=roboto', schoolSlug: 'dai-hoc-fpt' },
    ],

    faq: [ /* ... */ ], // Bổ sung chi tiết
    contactInfo: { /* ... */ } // Bổ sung chi tiết
};

// Giả định hàm lấy dữ liệu chi tiết ngành dựa trên slug
export const getMajorDetailBySlug = (schoolSlug: string, majorSlug: string): MajorDetail | undefined => {
    // Trong thực tế, bạn sẽ gọi API backend dựa trên schoolSlug và majorSlug
    console.log(`Workspaceing data for school: ${schoolSlug}, major: ${majorSlug}`);
    // Tạm thời dùng mock data:
    if (schoolSlug === 'dai-hoc-fpt' && majorSlug === 'cong-nghe-thong-tin') {
        return mockMajorDetail_IT_FPT;
    }
    // Thêm các ngành mock khác nếu có
    // if (schoolSlug === 'another-school-slug' && majorSlug === 'another-major-slug') {
    //     return mockAnotherMajorDetail;
    // }
    return undefined; // Trả về undefined nếu không tìm thấy
};