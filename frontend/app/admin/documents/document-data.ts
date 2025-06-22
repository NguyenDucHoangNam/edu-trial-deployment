// app/admin/documents/document-data.ts

export const subjectMap: Record<string, string> = {
    "Toán": "TOAN",
    "Vật lý": "VAT_LY",
    "Hóa học": "HOA_HOC",
    "Sinh học": "SINH_HOC",
    "Tiếng Anh": "TIENG_ANH",
    "Ngữ Văn": "NGU_VAN",
    "Lịch Sử": "LICH_SU",
    "Địa lý": "DIA_LY",
    "GDCD": "GDCD"
};

export const typeMap: Record<string, string> = {
    "Đề chính thức": "DE_CHINH_THUC",
    "Đề minh họa": "DE_MINH_HOA",
    "Đáp án chi tiết": "DAP_AN_CHI_TIET",
    "Hướng dẫn giải": "HUONG_DAN_GIAI"
};

export const subjectsForFilter = Object.keys(subjectMap);
export const typesForFilter = Object.keys(typeMap);

// Hàm để lấy lại tên hiển thị từ giá trị ENUM của API
export const getDisplayValue = (map: Record<string, string>, apiValue: string): string => {
    return Object.keys(map).find(key => map[key] === apiValue) || apiValue;
};