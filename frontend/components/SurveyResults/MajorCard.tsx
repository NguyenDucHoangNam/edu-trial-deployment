// components/SurveyResults/MajorCard.tsx
import React from 'react';
import UniversityCard from './UniversityCard'; // Component thẻ trường
import { MajorRecommendation } from '@/types/survey'; // Import kiểu dữ liệu

interface MajorCardProps {
  major: MajorRecommendation;
}

const MajorCard: React.FC<MajorCardProps> = ({ major }) => {
  return (
    <div className="rounded-xl bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:bg-dark-2 md:p-8 lg:p-10">
      {/* Phần Tiêu đề Ngành */}
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
           <span className="text-4xl">{major.icon}</span>
           <div>
             <h3 className="text-2xl font-bold text-black dark:text-white sm:text-3xl">
               {major.name}
             </h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">{major.description}</p>
           </div>
        </div>
         {/* Nút hành động cho ngành */}
         <div className="flex flex-shrink-0 gap-2">
             <button className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20">So Sánh</button>
             <button className="rounded-md bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary transition hover:bg-secondary/20">Lưu Ngành</button>
         </div>
      </div>

      {/* Phần Nội dung Chi tiết Ngành */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {/* Cột 1: Vì sao hợp & Ngày trong ngành */}
        <div className="md:col-span-1">
          <h4 className="mb-3 font-semibold text-black dark:text-white">Vì Sao Hợp Với Bạn?</h4>
          <ul className="mb-4 list-inside list-none space-y-1 text-sm text-body-color dark:text-dark-6">
            {major.fitReasons.map((reason, index) => (
              <li key={index} className="flex items-start">
                 <span className="mr-2 mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-primary"></span> {reason}
              </li>
            ))}
          </ul>
          {major.dayInLife && (
             <>
              <h4 className="mb-2 mt-4 font-semibold text-black dark:text-white">Một Ngày Trong Ngành:</h4>
              <p className="text-sm text-body-color dark:text-dark-6">{major.dayInLife} {/* Placeholder */}</p>
             </>
          )}
        </div>

        {/* Cột 2: Triển vọng & Kỹ năng */}
        <div className="md:col-span-1">
           <h4 className="mb-3 font-semibold text-black dark:text-white">Triển Vọng Tương Lai (VN)</h4>
           <div className="mb-4 space-y-1 text-sm text-body-color dark:text-dark-6">
                <p>🚀 Nhu cầu nhân lực: <span className="font-medium text-primary">{major.prospects.demand}</span></p>
                <p>💰 Mức lương tham khảo: <span className="font-medium text-primary">{major.prospects.salary}</span></p>
                <p>🧑‍💻 Công việc phổ biến: {major.prospects.jobs.join(", ")}</p>
                {/* Placeholder for chart */}
           </div>
           <h4 className="mb-3 mt-4 font-semibold text-black dark:text-white">Con Đường Rèn Luyện</h4>
           <ul className="list-inside list-none space-y-1 text-sm text-body-color dark:text-dark-6">
             {major.skills.map((skill, index) => (
               <li key={index} className="flex items-start">
                   <span className="mr-2 mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-secondary"></span>
                   {skill.name}
                   {skill.trialCourseLink && <a href={skill.trialCourseLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-primary hover:underline">(Thử ngay)</a>}
                   {skill.externalResourceLink && <a href={skill.externalResourceLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-blue-500 hover:underline">(Tìm hiểu)</a>}
               </li>
             ))}
           </ul>
        </div>

        {/* Cột 3: Các trường tiềm năng */}
        <div className="md:col-span-1">
          <h4 className="mb-3 font-semibold text-black dark:text-white">Trường Đại Học Tiềm Năng</h4>
          {major.universities.length > 0 ? (
            <div className="space-y-4">
              {major.universities.map((uni) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có gợi ý trường cụ thể cho ngành này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MajorCard;