import { Brand } from "@/types/brand";

const brandsData: Brand[] = [
  {
    id: 1,
    name: "Đại học Quốc gia Hà Nội", // Tên trường
    href: "https://www.vnu.edu.vn/home/", // <--- Placeholder: Link đến trang trường trên nền tảng của bạn (hoặc link website trường)
    image: "/images/brands/logo1.png", // <--- Placeholder: Đường dẫn đến file logo sau khi bạn đã lưu vào public
    imageLight: "/images/brands/logo1.png", // <--- Placeholder: Dùng chung hoặc thay bằng logo light mode nếu có
  },
  {
    id: 2,
    name: "Đại học Quốc gia TP.HCM",
    href: "https://vnuhcm.edu.vn/", // Placeholder link
    image: "/images/brands/logo2.png", // Placeholder path
    imageLight: "/images/brands/logo2.png",
  },
  {
    id: 3,
    name: "Đại học Bách khoa Hà Nội",
    href: "https://hust.edu.vn/", // Placeholder link
    image: "/images/brands/logo3.png", // Placeholder path
    imageLight: "/images/brands/logo3.png",
  },
  {
    id: 4,
    name: "Đại học Kinh tế Quốc dân",
    href: "https://www.neu.edu.vn/", // Placeholder link
    image: "/images/brands/logo4.png", // Placeholder path
    imageLight: "/images/brands/logo4.png",
  },
  {
    id: 5,
    name: "Đại học Ngoại thương", // Hoặc trường khác bạn chọn
    href: "https://ftu.edu.vn/", // Placeholder link
    image: "/images/brands/logo5.png", // Placeholder path
    imageLight: "/images/brands/logo5.png",
  },
];

export default brandsData;