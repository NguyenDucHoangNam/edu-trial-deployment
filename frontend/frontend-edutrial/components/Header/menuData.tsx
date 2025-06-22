import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Trang chủ",
    path: "/",
    newTab: false,
  },
  {
    id: 33,
    title: "Danh sách Trường",
    path: "/danh-sach-truong",
    newTab: false,
  },
  {
    id: 3,
    title: "Khóa học thử",
    path: "/hoc-thu",
    newTab: false,
  },

  {
    id: 4,
    title: "Tài nguyên & Tuyển sinh",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "Tài liệu THPTQG",
        path: "/tai-lieu-thptqg",
        newTab: false,
      },
      {
        id: 42,
        title: "Điểm chuẩn THPTQG",
        path: "/tra-cuu-diem-chuan",
        newTab: false,
      },
      {
        id: 43,
        title: "Công cụ tính điểm tốt nghiệp THPT ",
        path: "/cong-cu-tinh-diem-thpt",
        newTab: false,
      },
      {
        id: 44,
        title: "Tư vấn chọn trường đại học ",
        path: "/khao-sat",
        newTab: false,
      },
    ],
  },
  {
    id: 2,
    title: "Liên hệ",
    path: "/about",
    newTab: false,
  }
];
export default menuData;
