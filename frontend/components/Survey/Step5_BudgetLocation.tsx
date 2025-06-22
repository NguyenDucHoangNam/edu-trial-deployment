// components/Survey/Step5_BudgetLocation.tsx
import React, { useState, useEffect } from "react";

// Ví dụ các khoảng ngân sách
const budgetOptions = [
  { id: "budget_under_20", label: "💰 Dưới 20 triệu VNĐ / năm" },
  { id: "budget_20_50", label: "💰💰 20 - 50 triệu VNĐ / năm" },
  { id: "budget_50_100", label: "💰💰💰 50 - 100 triệu VNĐ / năm" },
  { id: "budget_over_100", label: "💰💰💰💰 Trên 100 triệu VNĐ / năm" },
  { id: "budget_scholarship", label: "🎓 Sẽ chủ động tìm học bổng / vay vốn" },
];

// Ví dụ các khu vực
const regionOptions = [
  { id: "region_north", label: "📍 Miền Bắc" },
  { id: "region_central", label: "📍 Miền Trung" },
  { id: "region_south", label: "📍 Miền Nam" },
];

interface Step5Props {
  answers: Partial<any>;
  updateAnswers: (stepAnswers: Partial<any>) => void;
}

export default function Step5_BudgetLocation({ answers, updateAnswers }: Step5Props) {
  const [selectedBudget, setSelectedBudget] = useState<string>(answers.budgetRange || "");
  const [scholarshipInterest, setScholarshipInterest] = useState<boolean>(answers.scholarshipInterest || false);
  const [preferredRegions, setPreferredRegions] = useState<Set<string>>(new Set(answers.preferredLocations || []));
  const [locationReason, setLocationReason] = useState<string>(answers.locationReason || "");

  useEffect(() => {
    updateAnswers({
      budgetRange: selectedBudget,
      scholarshipInterest: scholarshipInterest,
      preferredLocations: Array.from(preferredRegions),
      locationReason: locationReason,
    });
  }, [selectedBudget, scholarshipInterest, preferredRegions, locationReason, updateAnswers]);

   const toggleRegion = (regionId: string) => {
    setPreferredRegions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(regionId)) {
        newSet.delete(regionId);
      } else {
        newSet.add(regionId);
      }
      return newSet;
    });
  };


  return (
    <div>
      {/* Phần 1: Ngân sách dự kiến */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Ngân Sách Dự Kiến
        </h2>
        <p className="mb-4 text-base text-body-color dark:text-dark-6">
          Gia đình bạn dự kiến có thể hỗ trợ mức học phí đại học hàng năm cho bạn ở khoảng nào? (Chọn một)
        </p>
        <div className="space-y-3">
          {budgetOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center space-x-3 rounded-md border border-gray-300 p-3 transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark">
              <input
                type="radio"
                name="budgetRange"
                value={option.id}
                checked={selectedBudget === option.id}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-base text-body-color dark:text-dark-6">{option.label}</span>
            </label>
          ))}
        </div>
        {/* Câu hỏi về học bổng chỉ hiển thị nếu không chọn phương án cuối */}
        {selectedBudget !== 'budget_scholarship' && (
             <div className="mt-4 rounded-md border border-gray-300 p-3 dark:border-dark-3">
               <label className="flex cursor-pointer items-center space-x-3">
                 <input
                   type="checkbox"
                   checked={scholarshipInterest}
                   onChange={(e) => setScholarshipInterest(e.target.checked)}
                   className="h-4 w-4 rounded text-primary focus:ring-primary"
                 />
                 <span className="text-base text-body-color dark:text-dark-6">Bạn có sẵn lòng tìm kiếm thêm học bổng / vay vốn để theo học các chương trình tốt hơn (có thể có học phí cao hơn mức đã chọn)?</span>
               </label>
             </div>
        )}
      </div>

      {/* Phần 2: Địa điểm mong muốn */}
      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Địa Điểm Mong Muốn
        </h2>
        <p className="mb-4 text-base text-body-color dark:text-dark-6">
          Bạn ưu tiên học tập tại khu vực nào ở Việt Nam? (Có thể chọn nhiều)
        </p>
        <div className="space-y-3">
          {regionOptions.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center space-x-3 rounded-md border border-gray-300 p-3 transition hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark">
              <input
                type="checkbox"
                checked={preferredRegions.has(option.id)}
                onChange={() => toggleRegion(option.id)}
                className="h-4 w-4 rounded text-primary focus:ring-primary"
              />
              <span className="text-base text-body-color dark:text-dark-6">{option.label}</span>
            </label>
          ))}
        </div>

         {/* Lý do chọn địa điểm */}
          <div className="mt-6">
            <label htmlFor="locationReason" className="mb-3 block text-base font-medium text-body-color dark:text-dark-6">
              Lý do chính bạn chọn (các) khu vực trên là gì? (VD: Gần nhà, thành phố lớn nhiều cơ hội, chi phí sinh hoạt, có trường mục tiêu,...)
            </label>
            <textarea
              id="locationReason"
              rows={3}
              value={locationReason}
              onChange={(e) => setLocationReason(e.target.value)}
              placeholder="Chia sẻ lý do của bạn..."
              className="w-full resize-none rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-body-color outline-none focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark dark:text-dark-6"
            ></textarea>
          </div>
      </div>
    </div>
  );
}