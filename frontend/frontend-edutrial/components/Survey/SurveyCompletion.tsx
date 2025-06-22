// components/Survey/SurveyCompletion.tsx
import React from 'react';

interface CompletionProps {
  answers: Partial<any>;
}

export default function SurveyCompletion({ answers }: CompletionProps) {
  // Trong thực tế, bạn sẽ gửi 'answers' lên server ở bước trước
  // và trang này có thể hiển thị thông báo hoặc chuyển hướng đến trang kết quả
  return (
    <div className="text-center">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Chúc mừng bạn đã hoàn thành khảo sát!
      </h2>
      <p className="mb-6 text-lg text-body-color dark:text-dark-6">
        Chúng tôi đang phân tích câu trả lời của bạn để đưa ra những gợi ý phù hợp nhất.
      </p>
      {/* Có thể thêm nút để xem kết quả (nếu có trang kết quả riêng) */}
      {/* <button className="rounded-md bg-primary px-6 py-2 text-base font-medium text-white transition hover:bg-opacity-90">
        Xem Kết Quả Sơ Bộ
      </button> */}

      {/* Phần này chỉ để debug, hiển thị câu trả lời đã thu thập */}
      {/* <div className="mt-8 text-left text-sm">
        <h3 className="font-semibold">Dữ liệu đã thu thập (Debug):</h3>
        <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-100 p-2 dark:bg-dark">
          {JSON.stringify(answers, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}