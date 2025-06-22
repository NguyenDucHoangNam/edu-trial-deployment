// app/tai-lieu-thptqg/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from 'react';
// SỬA LỖI: Thêm Search vào import từ lucide-react
import { BookText, Filter, Download, CalendarDays, Tag, FileText, ChevronDown, ChevronUp, Search } from 'lucide-react';
// SỬA LỖI: Thêm các import cần thiết cho react-toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// --- Định nghĩa Interface và các kiểu dữ liệu ---
interface Document {
    id: number;
    title: string;
    subject: string; // API trả về dạng ENUM (e.g., "VAT_LY")
    year: number;
    type: string;    // API trả về dạng ENUM (e.g., "DE_MINH_HOA")
    fileUrl: string;
    fileSize?: string;
    description?: string;
}

// --- Dữ liệu và các hàm ánh xạ cho bộ lọc ---
// Ánh xạ từ giá trị người dùng thấy (UI) sang giá trị API cần
const subjectMap: Record<string, string> = {
    "Toán": "TOAN",
    "Vật lý": "VAT_LY",
    "Hóa học": "HOA_HOC",
    "Sinh học": "SINH_HOC",
    "Tiếng Anh": "TIENG_ANH",
    "Ngữ Văn": "NGU_VAN",
    "Lịch Sử": "LICH_SU",
    "Địa lý": "DIA_LY",
    "GDCD": "GDCD"
};

const typeMap: Record<string, string> = {
    "Đề chính thức": "DE_CHINH_THUC",
    "Đề minh họa": "DE_MINH_HOA",
    "Đáp án chi tiết": "DAP_AN_CHI_TIET",
    "Hướng dẫn giải": "HUONG_DAN_GIAI"
};

// Tạo mảng để render dropdowns
const subjectsForFilter = Object.keys(subjectMap);
const yearsForFilter = [2025, 2024, 2023, 2022, 2021, 2020];
const typesForFilter = Object.keys(typeMap);

// Hàm để lấy lại tên hiển thị từ giá trị ENUM của API
const getDisplayValue = (map: Record<string, string>, apiValue: string): string => {
    return Object.keys(map).find(key => map[key] === apiValue) || apiValue;
};


// --- Các Component con ---
const DocumentItem: React.FC<{ document: Document }> = ({ document }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="flex items-start space-x-4">
                <FileText className="w-10 h-10 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{document.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        <span className="flex items-center"><BookText className="w-3.5 h-3.5 mr-1" /> {getDisplayValue(subjectMap, document.subject)}</span>
                        <span className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1" /> {document.year}</span>
                        <span className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1" /> {getDisplayValue(typeMap, document.type)}</span>
                        {document.fileSize && <span className="flex items-center">Kích thước: {document.fileSize}</span>}
                    </div>
                    {document.description && <p className="text-sm text-gray-600 mb-4">{document.description}</p>}
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <a href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-150">
                    <Download className="w-4 h-4 mr-2" />
                    Tải về
                </a>
            </div>
        </div>
    );
};

// --- Component Trang Chính ---
const TaiLieuTHPTQGPage: React.FC = () => {
    // State cho bộ lọc
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    
    // State cho dữ liệu và giao diện
    const [groupedDocs, setGroupedDocs] = useState<Record<string, Document[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

    // Hàm gọi API
    const fetchDocuments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedSubject) params.append('subject', subjectMap[selectedSubject]);
            if (selectedYear) params.append('year', selectedYear);
            if (selectedType) params.append('type', typeMap[selectedType]);
            
            params.append('page', '0');
            params.append('size', '100'); 

            const response = await fetch(`/api/v1/documents/public/grouped-by-year?${params.toString()}`);
            if (!response.ok) throw new Error('Không thể tải tài liệu.');

            const result = await response.json();
            if (result.success && result.data) {
                setGroupedDocs(result.data);

                const years = Object.keys(result.data).sort((a, b) => Number(b) - Number(a));
                if (years.length > 0 && Object.keys(expandedYears).length === 0) {
                     setExpandedYears({ [years[0]]: true });
                }
            } else {
                setGroupedDocs({});
            }
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedSubject, selectedYear, selectedType]);

    // Gọi API khi bộ lọc thay đổi
    useEffect(() => {
        // Debounce để tránh gọi API liên tục khi người dùng thay đổi filter nhanh
        const handler = setTimeout(() => {
             fetchDocuments();
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [selectedSubject, selectedYear, selectedType, fetchDocuments]);

    const toggleYearExpansion = (year: string) => {
        setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    };
    
    return (
        <section className="pt-[120px]">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-sky-100 to-blue-100 shadow-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center md:justify-between">
                             <div className="flex items-center text-blue-700 mb-3 md:mb-0">
                                 <BookText className="w-10 h-10 md:w-12 md:h-12 mr-3" />
                                 <h1 className="text-2xl md:text-3xl font-bold">Tài liệu THPT Quốc Gia</h1>
                             </div>
                             <p className="text-sm text-gray-600 max-w-md md:text-right">
                                 Nguồn tài liệu ôn thi THPT Quốc Gia chất lượng cao, tổng hợp đề thi và đáp án các năm.
                             </p>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-blue-600" /> Bộ lọc Tài liệu
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div>
                                 <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                                 <select id="subject-filter" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                     <option value="">Tất cả Môn</option>
                                     {subjectsForFilter.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                                 <select id="year-filter" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                     <option value="">Tất cả Năm</option>
                                     {yearsForFilter.map(year => <option key={year} value={year}>{year}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu</label>
                                 <select id="type-filter" value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                     <option value="">Tất cả Loại</option>
                                     {typesForFilter.map(type => <option key={type} value={type}>{type}</option>)}
                                 </select>
                             </div>
                        </div>
                    </div>

                    {isLoading ? <div className="text-center py-12">Đang tải tài liệu...</div> : (
                        Object.keys(groupedDocs).length > 0 ? (
                            <div className="space-y-10">
                                {Object.entries(groupedDocs)
                                    .sort((a, b) => Number(b[0]) - Number(a[0])) // Sắp xếp năm mới nhất lên đầu
                                    .map(([year, docsInYear]) => (
                                    <div key={year} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                        <button onClick={() => toggleYearExpansion(year)} className="w-full flex justify-between items-center text-left text-2xl font-bold text-blue-700 mb-6 pb-2 border-b-2 border-blue-200 hover:border-blue-400 transition-colors">
                                            <span>Năm {year}</span>
                                            {expandedYears[year] ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                        </button>
                                        {expandedYears[year] && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {docsInYear.map(doc => <DocumentItem key={doc.id} document={doc} />)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-xl text-gray-600">Không tìm thấy tài liệu nào phù hợp.</p>
                                <p className="text-sm text-gray-500 mt-2">Vui lòng thử thay đổi các tiêu chí tìm kiếm.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
};

export default TaiLieuTHPTQGPage;
