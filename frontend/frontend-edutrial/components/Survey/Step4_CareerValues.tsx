// components/Survey/Step4_CareerValues.tsx
import React, { useState, useEffect } from "react";

// Ví dụ các cặp giá trị cho La Bàn Sự Nghiệp
const careerValuePairs = [
  {
    id: "pair1",
    question: "Bạn ưu tiên điều gì hơn?",
    optionA: { value: "high_income_early", label: "💸 Thu nhập cao ngay từ đầu" },
    optionB: { value: "continuous_learning", label: "🌱 Cơ hội học hỏi và phát triển liên tục" },
  },
  {
    id: "pair2",
    question: "Bạn ưu tiên điều gì hơn?",
    optionA: { value: "stability_security", label: "🏦 Sự ổn định, chắc chắn trong công việc" },
    optionB: { value: "dynamic_challenge", label: "🚀 Môi trường năng động, nhiều thử thách" },
  },
  {
    id: "pair3",
    question: "Bạn ưu tiên điều gì hơn?",
    optionA: { value: "social_impact", label: "🌍 Tạo ra ảnh hưởng, đóng góp cho xã hội" },
    optionB: { value: "recognition_advancement", label: "🏆 Đạt được sự công nhận, vị trí cao" },
  },
   {
    id: "pair4",
    question: "Bạn ưu tiên điều gì hơn?",
    optionA: { value: "work_life_balance", label: "⚖️ Cân bằng công việc - cuộc sống" },
    optionB: { value: "career_dedication", label: "🔥 Cống hiến hết mình cho sự nghiệp" },
  },
   {
    id: "pair5",
    question: "Bạn ưu tiên điều gì hơn?",
    optionA: { value: "independence_autonomy", label: "👤 Làm việc độc lập, tự chủ cao" },
    optionB: { value: "teamwork_collaboration", label: "🤝 Làm việc trong đội nhóm mạnh, gắn kết" },
  },
];

// Ví dụ các động lực nội tâm
const innerMotivationOptions = [
    { id: "motivation_money", label: "Kiếm được nhiều tiền" },
    { id: "motivation_create", label: "Tạo ra sản phẩm/dịch vụ hữu ích" },
    { id: "motivation_help", label: "Giúp đỡ người khác / Cộng đồng" },
    { id: "motivation_recognition", label: "Được công nhận, tôn trọng" },
    { id: "motivation_good_env", label: "Môi trường làm việc tốt" },
    { id: "motivation_growth", label: "Cơ hội học hỏi, thăng tiến" },
    { id: "motivation_freedom", label: "Sự tự do, linh hoạt, sáng tạo" },
];

interface Step4Props {
  answers: Partial<any>;
  updateAnswers: (stepAnswers: Partial<any>) => void;
}

export default function Step4_CareerValues({ answers, updateAnswers }: Step4Props) {
  const [careerPriorities, setCareerPriorities] = useState<Record<string, string>>(answers.careerValues || {});
  const [selectedMotivations, setSelectedMotivations] = useState<Set<string>>(new Set(answers.innerMotivations || []));
  const [otherMotivation, setOtherMotivation] = useState<string>(answers.otherMotivation || "");


  useEffect(() => {
    updateAnswers({
        careerValues: careerPriorities,
        innerMotivations: Array.from(selectedMotivations),
        otherMotivation: otherMotivation
    });
  }, [careerPriorities, selectedMotivations, otherMotivation, updateAnswers]);

  const handlePriorityChange = (pairId: string, value: string) => {
    setCareerPriorities((prev) => ({ ...prev, [pairId]: value }));
  };

 const toggleMotivation = (motivationId: string) => {
    setSelectedMotivations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(motivationId)) {
        newSet.delete(motivationId);
      } else {
        newSet.add(motivationId);
      }
      return newSet;
    });
  };


  return (
    <div>
      {/* Phần 1: La Bàn Sự Nghiệp */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          La Bàn Sự Nghiệp
        </h2>
        <p className="mb-6 text-base text-body-color dark:text-dark-6">
          Hãy cân nhắc và cho biết bạn sẽ nghiêng về lựa chọn nào hơn trong các cặp giá trị dưới đây khi nghĩ về công việc tương lai.
        </p>
        <div className="space-y-6">
          {careerValuePairs.map((pair) => (
            <div key={pair.id} className="rounded-md border border-gray-200 p-4 dark:border-dark-3">
              <p className="mb-3 font-medium text-black dark:text-white">{pair.question}</p>
              <div className="space-y-2">
                 <label className="flex cursor-pointer items-center space-x-3">
                   <input
                     type="radio"
                     name={pair.id}
                     value={pair.optionA.value}
                     checked={careerPriorities[pair.id] === pair.optionA.value}
                     onChange={(e) => handlePriorityChange(pair.id, e.target.value)}
                     className="h-4 w-4 text-primary focus:ring-primary"
                   />
                   <span className="text-base text-body-color dark:text-dark-6">{pair.optionA.label}</span>
                 </label>
                 <label className="flex cursor-pointer items-center space-x-3">
                   <input
                     type="radio"
                     name={pair.id}
                     value={pair.optionB.value}
                     checked={careerPriorities[pair.id] === pair.optionB.value}
                     onChange={(e) => handlePriorityChange(pair.id, e.target.value)}
                     className="h-4 w-4 text-primary focus:ring-primary"
                   />
                   <span className="text-base text-body-color dark:text-dark-6">{pair.optionB.label}</span>
                 </label>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* Phần 2: Động Lực Nội Tâm */}
        <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Động Lực Nội Tâm
            </h2>
            <p className="mb-4 text-base text-body-color dark:text-dark-6">
            Điều gì thực sự quan trọng và tạo động lực cho bạn trong công việc tương lai? (Chọn những điều quan trọng nhất)
            </p>
            <div className="space-y-3">
            {innerMotivationOptions.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center space-x-3 rounded-md border border-gray-300 p-3 transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark">
                <input
                    type="checkbox"
                    checked={selectedMotivations.has(option.id)}
                    onChange={() => toggleMotivation(option.id)}
                    className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-base text-body-color dark:text-dark-6">{option.label}</span>
                </label>
            ))}
             {/* Ô nhập khác */}
              <div className="pt-2">
                 <label htmlFor="otherMotivation" className="mb-2 block text-base font-medium text-body-color dark:text-dark-6">
                    Động lực khác (nếu có):
                 </label>
                 <input
                   id="otherMotivation"
                   type="text"
                   value={otherMotivation}
                   onChange={(e) => setOtherMotivation(e.target.value)}
                   placeholder="Nhập động lực khác của bạn..."
                   className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark dark:text-dark-6"
                 />
              </div>
            </div>
        </div>
    </div>
  );
}