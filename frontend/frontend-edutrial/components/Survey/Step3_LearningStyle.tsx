// components/Survey/Step3_LearningStyle.tsx
import React, { useState, useEffect } from "react";

// Ví dụ các phương pháp học
const learningMethodsOptions = [
  { id: "listen_lecture", label: "🎧 Nghe giảng trực tiếp / Ghi chép" },
  { id: "watch_video", label: "📺 Xem video bài giảng / Minh họa trực tuyến" },
  { id: "read_docs", label: "📚 Đọc sách / Tài liệu chi tiết" },
  { id: "do_exercise", label: "✍️ Tự làm bài tập / Thực hành" },
  { id: "group_discuss", label: "🗣️ Thảo luận / Học nhóm với bạn bè" },
  { id: "teach_others", label: "👨‍🏫 Dạy lại cho người khác" },
  { id: "real_project", label: "🛠️ Tìm hiểu qua dự án thực tế" },
  { id: "mindmap_flashcard", label: "🧠 Sử dụng sơ đồ tư duy / flashcards" },
];

// Ví dụ môi trường học
const learningEnvironmentOptions = [
  { id: "env_quiet", label: "🤫 Hoàn toàn yên tĩnh, một mình (thư viện, phòng riêng)" },
  { id: "env_ambient", label: "☕ Có chút tiếng ồn xung quanh (quán cà phê, không gian chung)" },
  { id: "env_small_group", label: "🧑‍🤝‍🧑 Học cùng một vài người bạn thân (nhưng yên lặng)" },
  { id: "env_interactive", label: "❓ Cần có người hướng dẫn / hỏi đáp ngay" },
  { id: "env_open_space", label: "🚶 Thích không gian mở, có thể đi lại" },
];

interface Step3Props {
  answers: Partial<any>;
  updateAnswers: (stepAnswers: Partial<any>) => void;
}

export default function Step3_LearningStyle({ answers, updateAnswers }: Step3Props) {
  // Sử dụng Set để quản lý các phương pháp được chọn (dễ dàng thêm/xóa)
  const [preferredMethods, setPreferredMethods] = useState<Set<string>>(
    new Set(answers.learningMethods || [])
  );
  const [idealEnvironment, setIdealEnvironment] = useState<string>(answers.learningEnvironment || "");

  // Chuyển Set thành Array trước khi cập nhật state cha
  useEffect(() => {
    updateAnswers({
      learningMethods: Array.from(preferredMethods),
      learningEnvironment: idealEnvironment,
    });
  }, [preferredMethods, idealEnvironment, updateAnswers]);

  const toggleMethod = (methodId: string) => {
    setPreferredMethods((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(methodId)) {
        newSet.delete(methodId);
      } else {
        newSet.add(methodId);
      }
      return newSet;
    });
  };

  return (
    <div>
      {/* Phần 1: Công Thức Học Tập Hiệu Quả */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Công Thức Học Tập Hiệu Quả
        </h2>
        <p className="mb-4 text-base text-body-color dark:text-dark-6">
          Để học một kiến thức mới hiệu quả, bạn thường thích sử dụng những phương pháp nào nhất? (Chọn những phương pháp bạn thấy phù hợp)
        </p>
        <div className="space-y-3">
          {learningMethodsOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center space-x-3 rounded-md border border-gray-300 p-3 transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark">
              <input
                type="checkbox"
                checked={preferredMethods.has(option.id)}
                onChange={() => toggleMethod(option.id)}
                className="h-4 w-4 rounded text-primary focus:ring-primary" // Tailwind form plugin cần thiết cho `rounded`
              />
              <span className="text-base text-body-color dark:text-dark-6">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Phần 2: Môi Trường Lý Tưởng */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Môi Trường Học Tập Lý Tưởng
        </h2>
        <p className="mb-4 text-base text-body-color dark:text-dark-6">
          Bạn cảm thấy mình tập trung và học hiệu quả nhất trong môi trường như thế nào? (Chọn một)
        </p>
        <div className="space-y-3">
          {learningEnvironmentOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center space-x-3 rounded-md border border-gray-300 p-3 transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark">
              <input
                type="radio"
                name="learningEnvironment"
                value={option.id}
                checked={idealEnvironment === option.id}
                onChange={(e) => setIdealEnvironment(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-base text-body-color dark:text-dark-6">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}