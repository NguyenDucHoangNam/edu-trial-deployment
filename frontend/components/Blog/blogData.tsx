import { Blog } from "@/types/blog";

const blogData: Blog[] = [
  {
    id: 1,
    title: "Công cụ Định hướng AI của Edutrial: Khám phá bản thân, chọn ngành chuẩn",
    paragraph:
      "Bạn băn khoăn về ngành học? Công cụ AI độc quyền của Edutrial giúp phân tích điểm mạnh, sở thích qua quiz và khảo sát, đưa ra gợi ý phù hợp nhất.",
    image: "/images/blog/author-edutrial.jpg",
    author: {
      name: "Đội ngũ Edutrial",
      image: "/images/blog/author-01.png",
      designation: "Biên tập",
    },
    tags: ["AI"],
    publishDate: "15 Thg 05, 2024",
  },
  {
    id: 2,
    title: "Bí quyết học thử Đại học hiệu quả trên nền tảng Edutrial",
    paragraph:
      "Đừng chỉ xem qua loa! Tận dụng tối đa các khóa học thử bằng cách tập trung vào nội dung, phương pháp giảng dạy và làm bài quiz để có cái nhìn sâu sắc.",
    image: "/images/blog/author-chuyengia.jpg",
    author: {
      name: "Chuyên gia tư vấn Edutrial",
      image: "/images/blog/author-02.png",
      designation: "Chuyên gia tư vấn",
    },
    tags: ["Học thử"],
    publishDate: "10 Thg 05, 2024",
  },
  {
    id: 3,
    title: "Các phương thức xét tuyển Đại học 2025: Hướng dẫn chi tiết",
    paragraph:
      "Tìm hiểu các phương thức xét tuyển phổ biến (điểm thi THPT, học bạ, đánh giá năng lực...) để lên kế hoạch phù hợp cho mùa tuyển sinh sắp tới.",
    image: "/images/blog/author-edutrial2.jpg",
    author: {
      name: "Đội ngũ Edutrial",
      image: "/images/blog/author-03.png",
      designation: "Biên tập",
    },
    tags: ["Tuyển sinh"],
    publishDate: "05 Thg 05, 2024",
  },
];
export default blogData;