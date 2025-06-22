// components/Survey/Step1_Interests.tsx
import React, { useState, useEffect } from "react";

// Định nghĩa các thẻ sở thích mẫu
const interestOptions = [
  { id: "lap_trinh", label: "💻 Lập trình / Code", category: "Công nghệ" },
  { id: "ve_thiet_ke", label: "🎨 Vẽ / Thiết kế", category: "Nghệ thuật" },
  { id: "choi_nhac", label: "🎵 Chơi nhạc cụ", category: "Nghệ thuật" },
  { id: "kinh_doanh", label: "📈 Kinh doanh / Bán hàng", category: "Kinh doanh" },
  { id: "viet_lach", label: "✍️ Viết lách / Sáng tác", category: "Nghệ thuật" },
  { id: "nghien_cuu_kh", label: "🔬 Nghiên cứu Khoa học", category: "Khoa học" },
  { id: "tinh_nguyen", label: "🤝 Hoạt động Tình nguyện", category: "Xã hội" },
  { id: "the_thao", label: "⚽ Chơi Thể thao", category: "Thể chất" },
  { id: "nau_an", label: "🍳 Nấu ăn / Làm bánh", category: "Sáng tạo" },
  { id: "chup_anh", label: "📷 Nhiếp ảnh / Quay phim", category: "Nghệ thuật" },
  { id: "du_lich", label: "✈️ Du lịch / Khám phá", category: "Khám phá" },
  { id: "doc_sach", label: "📚 Đọc sách", category: "Tri thức" },
  { id: "hoc_ngoai_ngu", label: "🗣️ Học Ngoại ngữ", category: "Tri thức" },
  // Thêm các sở thích khác tại đây
];

interface Step1Props {
  answers: Partial<any>; // Nên thay 'any' bằng kiểu SurveyAnswers chi tiết
  updateAnswers: (stepAnswers: Partial<any>) => void;
}

export default function Step1_Interests({ answers, updateAnswers }: Step1Props) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(answers.interests || []);
  const [goldenMoment, setGoldenMoment] = useState(answers.goldenMoment || "");

  // Cập nhật state của component cha khi state nội bộ thay đổi
  useEffect(() => {
    updateAnswers({ interests: selectedInterests, goldenMoment });
  }, [selectedInterests, goldenMoment, updateAnswers]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  return (
    <div>
      {/* Phần 1: Bức Tường Ý Tưởng (Clickable Cards) */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Sở thích & Đam mê của bạn là gì?
        </h2>
        <p className="mb-6 text-base text-body-color dark:text-dark-6">
          Chọn những hoạt động hoặc chủ đề khiến bạn cảm thấy hứng thú nhất.
          Hãy thoải mái chọn nhiều nhé!
        </p>
        <div className="flex flex-wrap gap-3">
          {interestOptions.map((interest) => (
            <button
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-md ${
                selectedInterests.includes(interest.id)
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-black hover:border-primary hover:text-primary dark:border-dark-3 dark:bg-dark dark:text-white dark:hover:border-primary"
              }`}
            >
              {interest.label}
            </button>
          ))}
        </div>
         {/* Có thể thêm ô input cho sở thích khác */}
         {/* <input type="text" placeholder="Sở thích khác..." className="mt-4 w-full rounded-md border border-gray-300 p-2 dark:border-dark-3 dark:bg-dark" /> */}
      </div>

      {/* Phần 2: Khoảnh Khắc Vàng (Open Text) */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Khoảnh Khắc Vàng
        </h2>
        <label
          htmlFor="goldenMoment"
          className="mb-3 block text-base font-medium text-body-color dark:text-dark-6"
        >
          Hãy nhớ lại một lần bạn làm điều gì đó (học tập, chơi, sáng tạo...) mà cảm thấy cực kỳ say mê, quên cả thời gian. Đó là hoạt động gì và điều gì khi đó khiến bạn cảm thấy tuyệt vời như vậy?
        </label>
        <textarea
          id="goldenMoment"
          rows={4}
          value={goldenMoment}
          onChange={(e) => setGoldenMoment(e.target.value)}
          placeholder="Chia sẻ câu chuyện của bạn ở đây..."
          className="w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark dark:text-dark-6"
        ></textarea>
      </div>
    </div>
  );
}