// app/khao-sat/page.tsx
"use client";

import React, { useState } from "react";
import Step1_Interests from "@/components/Survey/Step1_Interests";
import Step2_Strengths from "@/components/Survey/Step2_Strengths";
import Step3_LearningStyle from "@/components/Survey/Step3_LearningStyle";
import Step4_CareerValues from "@/components/Survey/Step4_CareerValues";
import Step5_BudgetLocation from "@/components/Survey/Step5_BudgetLocation";
import SurveyCompletion from "@/components/Survey/SurveyCompletion"; // Component khi hoàn thành

// Định nghĩa kiểu dữ liệu cho câu trả lời (ví dụ)
interface SurveyAnswers {
  interests: string[];
  passionActivities: { activity: string; level: number }[];
  superpower: string;
  teamRole: string;
  scenario1: string;
  scenario2: string;
  bestSubject: string;
  subjectSkill: string;
  learningMethods: { method: string; rank: number }[];
  learningEnvironment: string;
  careerValues: Record<string, string>; // Lưu các lựa chọn ưu tiên
  innerMotivation: string;
  budgetRange: string;
  scholarshipInterest: boolean;
  preferredLocations: string[];
  locationReasons: Record<string, string[]>;
}

const TOTAL_STEPS = 6; // 5 bước khảo sát + 1 bước hoàn thành

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Partial<SurveyAnswers>>({}); // Lưu trữ câu trả lời từng phần

  // Hàm cập nhật câu trả lời từ các component con
  const updateAnswers = (stepAnswers: Partial<SurveyAnswers>) => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, ...stepAnswers }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển bước
    } else {
      // Xử lý khi hoàn thành khảo sát (ví dụ: gửi dữ liệu lên server)
      console.log("Khảo sát hoàn thành:", answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
       window.scrollTo(0, 0);
    }
  };

  // Hàm render component cho bước hiện tại
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Interests answers={answers} updateAnswers={updateAnswers} />;
      case 2:
        return <Step2_Strengths answers={answers} updateAnswers={updateAnswers} />;
      case 3:
        return <Step3_LearningStyle answers={answers} updateAnswers={updateAnswers} />;
      case 4:
        return <Step4_CareerValues answers={answers} updateAnswers={updateAnswers} />;
      case 5:
        return <Step5_BudgetLocation answers={answers} updateAnswers={updateAnswers} />;
      case 6:
        return <SurveyCompletion answers={answers} />;
      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep -1) / (TOTAL_STEPS -1)) * 100;

  return (
    <section className="relative z-10 overflow-hidden pb-[120px] pt-[180px] md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg dark:bg-dark-2 md:p-8 lg:p-12">
          <h1 className="mb-6 text-center text-3xl font-bold text-black dark:text-white sm:text-4xl">
            Khám Phá Bản Thân
          </h1>

           {/* Thanh tiến trình */}
           {currentStep <= TOTAL_STEPS -1 && (
             <div className="mb-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">Bước {currentStep} / {TOTAL_STEPS - 1}</span>
                  <span className="text-sm font-medium text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
           )}


          {/* Hiển thị component của bước hiện tại */}
          <div className="min-h-[300px]">
             {renderStep()}
          </div>


          {/* Nút điều hướng */}
          <div className="mt-8 flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`rounded-md px-6 py-2 text-base font-medium transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
                currentStep === 1
                  ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400"
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              }`}
            >
              Quay Lại
            </button>
            <button
              onClick={handleNext}
              className="rounded-md bg-primary px-6 py-2 text-base font-medium text-white transition hover:bg-opacity-90"
            >
              {currentStep === TOTAL_STEPS - 1 ? "Hoàn Thành" : currentStep === TOTAL_STEPS ? "Xem Kết Quả (Demo)" : "Tiếp Theo"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}