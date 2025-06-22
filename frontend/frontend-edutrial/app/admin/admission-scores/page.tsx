// app/admin/admission-scores/page.tsx

"use client";

import React, { useState, FormEvent } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { universityList } from '../../tra-cuu-diem-chuan/university-data'; // Tái sử dụng dữ liệu trường
import { FileUp, RefreshCw } from 'lucide-react';

// --- Component Form có thể tái sử dụng cho việc tải lên Excel ---
interface ExcelUploadFormProps {
    title: string;
    description: string;
    onSubmit: (formData: FormData) => Promise<void>;
    buttonText: string;
    buttonIcon: React.ReactNode;
}

const ExcelUploadForm: React.FC<ExcelUploadFormProps> = ({ title, description, onSubmit, buttonText, buttonIcon }) => {
    const [universityCode, setUniversityCode] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !universityCode || !year) {
            toast.warn("Vui lòng điền đầy đủ thông tin và chọn file.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('universityCode', universityCode);
        formData.append('year', String(year));

        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-8 rounded-xl shadow-lg border dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-primary/10 rounded-full mr-4 text-primary">
                    {buttonIcon}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor={`universityCode-${title}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trường Đại học</label>
                    <select
                        id={`universityCode-${title}`}
                        value={universityCode}
                        onChange={(e) => setUniversityCode(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600"
                    >
                        <option value="" disabled>-- Chọn trường --</option>
                        {universityList.map(u => <option key={u.code} value={u.code}>{u.code} - {u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor={`year-${title}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Năm tuyển sinh</label>
                    <input
                        type="number"
                        id={`year-${title}`}
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label htmlFor={`file-${title}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tệp Excel (.xlsx, .xls)</label>
                    <input
                        type="file"
                        id={`file-${title}`}
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        required
                        accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                </div>
            </div>
            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Đang xử lý...' : buttonText}
                </button>
            </div>
        </form>
    );
};


// --- Component Trang Chính ---
const AdmissionScoresAdminPage = () => {
    const { token } = useAuth();

    // Hàm chung để xử lý cả hai loại API
    const handleApiSubmit = async (formData: FormData, endpoint: 'import-excel' | 'update-excel') => {
        if (!token) {
            toast.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
            return;
        }
        try {
            const response = await fetch(`/api/v1/admission-scores/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Không cần 'Content-Type', trình duyệt sẽ tự đặt cho FormData
                },
                body: formData
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || `Lỗi khi gọi API: ${endpoint}`);
            }
            toast.success(result.message);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
        }
    };

    return (
        <section className="pb-12 pt-28 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Quản lý Điểm chuẩn</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Nhập hoặc cập nhật dữ liệu điểm chuẩn từ file Excel.</p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form để Nhập mới */}
                    <ExcelUploadForm
                        title="Nhập Điểm chuẩn"
                        description="Tải lên file Excel để thêm mới điểm chuẩn vào hệ thống."
                        onSubmit={(formData) => handleApiSubmit(formData, 'import-excel')}
                        buttonText="Nhập dữ liệu"
                        buttonIcon={<FileUp className="w-6 h-6"/>}
                    />
                    {/* Form để Cập nhật */}
                    <ExcelUploadForm
                        title="Cập nhật Điểm chuẩn"
                        description="Tải lên file Excel chứa ID để cập nhật các bản ghi điểm chuẩn đã có."
                        onSubmit={(formData) => handleApiSubmit(formData, 'update-excel')}
                        buttonText="Cập nhật dữ liệu"
                        buttonIcon={<RefreshCw className="w-6 h-6"/>}
                    />
                </div>
                 <div className="max-w-4xl mx-auto mt-8 bg-yellow-50 dark:bg-gray-800 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                             <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.276-1.21 2.912 0l7.105 13.62c.636 1.21-.362 2.78-1.722 2.78H2.874c-1.36 0-2.358-1.57-1.722-2.78l7.105-13.62zM9.25 9.75a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zm.75 4.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-200">
                                **Lưu ý:** File Excel tải lên cần tuân theo định dạng mẫu. Chức năng "Cập nhật" yêu cầu file phải có cột `ID` của điểm chuẩn cần sửa.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AdmissionScoresAdminPage;
