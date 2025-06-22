// components/SurveyResults/UniversityCard.tsx
import React from 'react';
import { UniversityRecommendation } from '@/types/survey'; // Import kiểu dữ liệu

interface UniversityCardProps {
  university: UniversityRecommendation;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ university }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors duration-200 hover:bg-gray-100 dark:border-dark-3 dark:bg-dark dark:hover:bg-opacity-80">
      {/* Header: Logo + Tên trường */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {university.logoUrl && (
            <img src={university.logoUrl} alt={`Logo ${university.name}`} className="h-6 w-auto flex-shrink-0 object-contain" />
          )}
          <h5 className="truncate text-sm font-semibold text-black dark:text-white" title={university.name}>
            {university.name}
          </h5>
        </div>
        <a href={university.websiteUrl || '#'} target="_blank" rel="noopener noreferrer" title="Website trường" className="text-primary hover:text-primary/80">
          {/* <FaExternalLinkAlt /> Thay bằng icon nếu dùng */}
          🔗
        </a>
      </div>

      {/* Checklist Phù Hợp */}
      <ul className="mb-3 list-none space-y-1 text-xs text-body-color dark:text-dark-6">
        <li className={`flex items-center ${university.tuitionMatch ? '' : 'opacity-70'}`}>
            {/* <FaDollarSign className="mr-1 text-green-600"/> Thay bằng icon */}
           <span className={university.tuitionMatch ? 'text-green-600' : ''}>✓</span> <span className="ml-1">Học phí: {university.tuition} {university.tuitionMatch ? '' : '(Ngoài khoảng đã chọn)'}</span>
        </li>
         <li className={`flex items-center ${university.locationMatch ? '' : 'opacity-70'}`}>
            {/* <FaMapMarkerAlt className="mr-1 text-blue-600"/> */}
            <span className={university.locationMatch ? 'text-blue-600' : ''}>✓</span> <span className="ml-1">Địa điểm: {university.location} {university.locationMatch ? '' : '(Ngoài khu vực ưu tiên)'}</span>
         </li>
         <li className="flex items-center">
            {/* <FaFlask className="mr-1 text-purple-600"/> */}
            <span className="text-purple-600">✓</span> <span className="ml-1">Thế mạnh: {university.strength}</span>
         </li>
      </ul>

       {/* Tiếng Nói Sinh Viên */}
       {university.review && (
         <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            {/* <FaComments className="mr-1 inline"/> */}
            <span>💬 Đánh giá: </span>
            <span className="font-semibold text-amber-500">★ {university.review.rating.toFixed(1)}</span>
            <span className="text-gray-500"> ({university.review.count}+)</span>
            <p className="mt-0.5 italic">"{university.review.quote}"</p>
         </div>
       )}

       {/* Sân Chơi Dành Cho Bạn */}
       {university.clubs && university.clubs.length > 0 && (
          <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
             <span> <span className="font-medium">CLB gợi ý:</span>{' '}
              {university.clubs.map((club, index) => (
                <span key={index} className="mr-1 inline-flex items-center rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-dark-3">
                   {club.icon} {club.name}
                </span>
              ))}
            </span>
          </div>
       )}

       {/* Người Truyền Cảm Hứng */}
        {university.alumni && (
         <div className="text-xs text-gray-600 dark:text-gray-400">
            {/* <FaUserGraduate className="mr-1 inline"/> */}
            <span>👨‍🎓 Cựu SV tiêu biểu: </span>
            <span className="font-medium">{university.alumni.name}</span>
            <span className="text-gray-500"> ({university.alumni.details})</span>
         </div>
       )}

       {/* Nút hành động cho trường */}
        <div className="mt-3 flex gap-2">
            <button className="flex-1 rounded-md bg-primary/10 px-2 py-1 text-center text-xs font-medium text-primary transition hover:bg-primary/20">Khám phá</button>
            <button className="flex-1 rounded-md bg-secondary/10 px-2 py-1 text-center text-xs font-medium text-secondary transition hover:bg-secondary/20">Lưu</button>
        </div>

    </div>
  );
};

export default UniversityCard;