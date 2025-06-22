// app/khao-sat/ket-qua/page.tsx
"use client";

import React from 'react';
// Ví dụ import icon (nếu dùng react-icons)
// import { FaLaptopCode, FaPaintBrush, FaBriefcase, FaCheckCircle, FaMapMarkerAlt, FaDollarSign, FaStar, FaUsers, FaUserGraduate, FaExternalLinkAlt, FaFlask, FaComments } from 'react-icons/fa';
import MajorCard from '@/components/SurveyResults/MajorCard'; // Component thẻ ngành
import { SurveyResultsData, StudentProfile } from '@/types/survey'; // Định nghĩa kiểu dữ liệu (sẽ tạo ở bước sau)

// --- DỮ LIỆU GIẢ LẬP (MOCK DATA) ---
// (Trong thực tế, bạn sẽ fetch dữ liệu này từ API)
const mockStudentProfile: StudentProfile = {
    name: "Minh Anh", // Tên học sinh (có thể lấy từ state hoặc context)
    topTraits: ["Lập trình Game", "Viết lách", "Giải quyết vấn đề logic", "Tạo ra sản phẩm đột phá"],
    archetype: "Nhà Sáng Tạo Kỹ Thuật",
};

const mockResultsData: SurveyResultsData = {
  studentProfile: mockStudentProfile,
  recommendedMajors: [
    // Ngành 1: Kỹ thuật Phần mềm
    {
      id: "ktpm",
      name: "Kỹ Thuật Phần Mềm",
      icon: "💻",
      description: "Ngành học ứng dụng các nguyên lý khoa học máy tính để thiết kế, phát triển, kiểm thử và bảo trì phần mềm.",
      fitReasons: [
        "Phù hợp với niềm yêu thích 'Lập trình' của bạn.",
        "Thể hiện tốt khả năng 'Giải quyết vấn đề logic'.",
        "Đáp ứng mong muốn 'Tạo ra sản phẩm đột phá'.",
        "Phong cách học 'Thực hành' rất quan trọng trong ngành này.",
      ],
      dayInLife: "Tưởng tượng một ngày bạn cùng team brainstorm ý tưởng, viết code cho tính năng mới, sửa lỗi và thấy sản phẩm mình làm ra được người dùng yêu thích...",
      prospects: {
        demand: "Cao",
        salary: "$$$",
        jobs: ["Developer", "Tester", "BA", "DevOps Engineer"],
      },
      skills: [
        { name: "Tư duy Logic & Giải thuật" },
        { name: "Lập trình (Python, Java...)", trialCourseLink: "/khoa-hoc-thu/python-nhap-mon" },
        { name: "Cấu trúc Dữ liệu", externalResourceLink: "#" },
        { name: "Tiếng Anh chuyên ngành" },
      ],
      universities: [
        {
          id: "hust", name: "Đại học Bách Khoa Hà Nội", logoUrl: "/images/logo/hust-logo.png", // Thay bằng đường dẫn thực
          tuition: "~25-30tr/năm", tuitionMatch: true, location: "Hà Nội", locationMatch: true,
          strength: "Đào tạo Kỹ thuật hàng đầu, nền tảng vững chắc.",
          review: { rating: 4.5, count: 210, quote: "Chương trình nặng nhưng chất, đầu ra uy tín." },
          clubs: [{ icon: "💻", name: "BKCoders" }, { icon: "🇬🇧", name: "BEC" }],
          alumni: { name: "Anh Trần Văn B", details: "K60 - Senior Engineer @ Google" },
          websiteUrl: "#"
        },
        {
           id: "fpt", name: "Đại học FPT", logoUrl: "/images/logo/fpt-logo.png",
           tuition: "~70tr/năm", tuitionMatch: false, location: "Hà Nội/HCM/ĐN", locationMatch: true,
           strength: "Thực hành nhiều, liên kết doanh nghiệp, tiếng Anh tốt.",
           review: { rating: 4.2, count: 150, quote: "Môi trường năng động, làm dự án thật từ sớm." },
           clubs: [{ icon: "💻", name: "F-Code" }, { icon: "🥋", name: "Vovinam Club" }],
           websiteUrl: "#"
        },
      ],
    },
    // Ngành 2: Truyền thông Đa phương tiện
    {
      id: "ttdpt",
      name: "Truyền Thông Đa Phương Tiện",
      icon: "🎨",
      description: "Ngành học về ứng dụng công nghệ thông tin trong sáng tạo, thiết kế các sản phẩm mỹ thuật đa phương tiện và truyền thông.",
      fitReasons: [
         "Rất hợp với sở thích 'Vẽ/Thiết kế' và 'Viết lách'.",
         "Khả năng 'Sáng tạo' của bạn sẽ được phát huy tối đa.",
         "Đáp ứng mong muốn làm việc trong môi trường 'Năng động, nhiều thử thách'.",
      ],
      dayInLife: "Bạn sẽ được học cách lên ý tưởng kịch bản, quay phim, chụp ảnh, thiết kế đồ họa, làm hậu kỳ, xây dựng các chiến dịch truyền thông sáng tạo...",
       prospects: { demand: "Cao", salary: "$$", jobs: ["Content Creator", "Video Editor", "Graphic Designer", "Social Media Manager"] },
       skills: [
          { name: "Tư duy Sáng tạo & Thẩm mỹ" },
          { name: "Kỹ năng Viết & Kể chuyện" },
          { name: "Sử dụng công cụ thiết kế (Adobe CC...)", trialCourseLink: "/khoa-hoc-thu/photoshop-co-ban" },
          { name: "Kiến thức Marketing & Truyền thông" },
       ],
       universities: [
          {
             id: "ajc", name: "Học viện Báo chí & Tuyên truyền", logoUrl: "/images/logo/ajc-logo.png",
             tuition: "~15-20tr/năm", tuitionMatch: true, location: "Hà Nội", locationMatch: true,
             strength: "Thương hiệu lâu đời, mạnh về lý luận và kỹ năng báo chí.",
             review: { rating: 4.0, count: 80, quote: "Nhiều hoạt động ngoại khóa sôi nổi, giảng viên nhiệt tình." },
             clubs: [{ icon: "📰", name: "CLB Truyền thông AJC" }, { icon: "🎤", name: "CLB MC" }],
             websiteUrl: "#"
          },
          // Thêm trường khác...
       ]
    },
    // Thêm ngành khác...
  ],
};

export default function SurveyResultsPage() {
  const { studentProfile, recommendedMajors } = mockResultsData; // Dùng dữ liệu giả lập

  // Trong thực tế, bạn sẽ dùng useEffect để fetch dữ liệu
  // const [resultsData, setResultsData] = useState<SurveyResultsData | null>(null);
  // useEffect(() => {
  //   fetch('/api/survey-results') // Thay bằng endpoint API của bạn
  //     .then(res => res.json())
  //     .then(data => setResultsData(data));
  // }, []);
  // if (!resultsData) return <div>Đang tải kết quả...</div>;
  // const { studentProfile, recommendedMajors } = resultsData;

  return (
    <section className="relative z-10 overflow-hidden pb-[60px] pt-[120px] md:pb-[80px] md:pt-[150px] xl:pb-[100px] xl:pt-[180px] 2xl:pb-[120px] 2xl:pt-[210px]">
      <div className="container mx-auto px-4">
        {/* Phần Giới Thiệu Cá Nhân Hóa */}
        <div className="mb-12 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-2 md:p-8 lg:p-10">
          <h1 className="mb-4 text-center text-3xl font-bold text-black dark:text-white sm:text-4xl lg:text-left">
            👋 Chào {studentProfile.name}, Hành Trình Khám Phá Bắt Đầu!
          </h1>
          <p className="mb-6 text-base text-body-color dark:text-dark-6 lg:w-4/5">
            Dựa trên sự kết hợp độc đáo giữa niềm đam mê{" "}
            {studentProfile.topTraits.slice(0, 2).map((trait, i) => (
                <strong key={i} className="text-primary">{`"${trait}"`}</strong>
            )).reduce((prev, curr) => [prev, ' và ', curr] as any)}
            , cùng khả năng <strong className="text-primary">{`"${studentProfile.topTraits[2]}"`}</strong> và
            mong muốn <strong className="text-primary">{`"${studentProfile.topTraits[3]}"`}</strong> mà bạn đã chia sẻ,
            hệ thống AI đã phân tích và đưa ra những gợi ý ngành học và trường đại học tiềm năng nhất dành riêng cho bạn.
          </p>
           {/* Placeholder cho hình ảnh hóa hồ sơ */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
             <span>Hồ sơ nổi bật:</span>
             <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">💡 Sáng tạo</span>
             <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">💻 Công nghệ</span>
             <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">🤝 Đồng đội</span>
             {/* Có thể thêm biểu đồ radar nhỏ ở đây */}
          </div>
        </div>

        {/* Phần Gợi Ý Ngành Vàng */}
        <div className="mb-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
            🌟 Top Ngành Học "Vàng" Dành Cho Bạn 🌟
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-1">
            {recommendedMajors.map((major) => (
              <MajorCard key={major.id} major={major} />
            ))}
          </div>
        </div>

        {/* Phần Hành Động Tiếp Theo */}
        <div className="rounded-lg bg-white p-6 text-center shadow-lg dark:bg-dark-2 md:p-8">
           <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
             🚀 Hành Trình Tiếp Theo Của Bạn
           </h2>
           <p className="mb-6 text-base text-body-color dark:text-dark-6">
              Lưu lại các lựa chọn yêu thích, khám phá khóa học thử và tìm hiểu kỹ hơn về các trường nhé!
           </p>
           <div className="flex flex-wrap justify-center gap-4">
              <button className="rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90">
                So Sánh Lựa Chọn Đã Lưu
              </button>
              <button className="rounded-md bg-secondary px-6 py-3 text-base font-medium text-white transition hover:bg-opacity-90">
                Xem Tất Cả Khóa Học Thử
              </button>
              <button className="rounded-md bg-gray-200 px-6 py-3 text-base font-medium text-black transition hover:bg-gray-300 dark:bg-dark-3 dark:text-white dark:hover:bg-opacity-80">
                Làm Lại Khảo Sát
              </button>
           </div>
        </div>
      </div>
    </section>
  );
}


// --- Định nghĩa kiểu dữ liệu (Tạo file riêng types/survey.ts) ---
// (Đặt code interface StudentProfile, ReviewSnippet, ClubMatch, AlumniSnippet, UniversityRecommendation, MajorRecommendation, SurveyResultsData vào đây)
// Ví dụ: export interface StudentProfile { ... }