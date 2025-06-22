// components/Survey/Step2_Strengths.tsx
import React, { useState, useEffect } from "react";

// Ví dụ câu hỏi tình huống
const scenario1Options = [
  { id: "s1_a", label: "Xem lại kỹ bài làm, tìm lỗi sai để rút kinh nghiệm." },
  { id: "s1_b", label: "Hỏi bạn bè xem họ làm bài thế nào." },
  { id: "s1_c", label: "Gặp giáo viên để hỏi rõ hơn và xin lời khuyên." },
  { id: "s1_d", label: "Cảm thấy hơi buồn nhưng sẽ cố gắng hơn lần sau." },
  { id: "s1_e", label: "Tự nhủ rằng môn này có lẽ không hợp với mình." },
];

interface Step2Props {
  answers: Partial<any>;
  updateAnswers: (stepAnswers: Partial<any>) => void;
}

export default function Step2_Strengths({ answers, updateAnswers }: Step2Props) {
  const [teamRole, setTeamRole] = useState(answers.teamRole || "");
  const [scenario1Answer, setScenario1Answer] = useState(answers.scenario1 || "");
  // Thêm state cho các câu hỏi khác của Bước 2

  useEffect(() => {
    // Cập nhật state cha khi state nội bộ thay đổi
    updateAnswers({ teamRole, scenario1: scenario1Answer /* ...các câu trả lời khác */ });
  }, [teamRole, scenario1Answer, updateAnswers]);

  return (
    <div>
      {/* Câu hỏi 1: Vai trò sở trường trong nhóm */}
       <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Vai Trò Sở Trường Trong Nhóm
        </h2>
        <p className="mb-4 text-base text-body-color dark:text-dark-6">
          Khi làm việc nhóm, bạn thường thấy mình đóng góp hiệu quả nhất ở vai trò nào?
        </p>
        <select
          value={teamRole}
          onChange={(e) => setTeamRole(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:bg-dark dark:text-dark-6"
        >
          <option value="">-- Chọn vai trò --</option>
          <option value="leader">Người đề xuất ý tưởng & lên kế hoạch</option>
          <option value="analyst">Người tìm kiếm & phân tích thông tin</option>
          <option value="peacemaker">Người kết nối & giữ hòa khí</option>
          <option value="implementer">Người thực hiện chi tiết & đảm bảo chất lượng</option>
          <option value="presenter">Người trình bày & thuyết phục</option>
        </select>
      </div>

      {/* Câu hỏi 2: Xử Lý Tình Huống Học Đường */}
       <div className="mb-6">
         <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
           Thử Thách Tình Huống
         </h2>
         <p className="mb-4 text-base text-body-color dark:text-dark-6">
            Bạn nhận được điểm kiểm tra thấp hơn nhiều so với mong đợi ở một môn bạn khá tự tin. Phản ứng đầu tiên của bạn là gì?
         </p>
         <div className="space-y-3">
            {scenario1Options.map((option) => (
              <label key={option.id} className="flex cursor-pointer items-center space-x-3 rounded-md border border-gray-300 p-3 transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark">
                 <input
                   type="radio"
                   name="scenario1"
                   value={option.id}
                   checked={scenario1Answer === option.id}
                   onChange={(e) => setScenario1Answer(e.target.value)}
                   className="h-4 w-4 text-primary focus:ring-primary"
                 />
                 <span className="text-base text-body-color dark:text-dark-6">{option.label}</span>
              </label>
            ))}
         </div>
       </div>
       {/* Thêm các câu hỏi khác cho Bước 2 tại đây */}
    </div>
  );
}