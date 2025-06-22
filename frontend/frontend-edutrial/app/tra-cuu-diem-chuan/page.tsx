// app/tra-cuu-diem-chuan/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { universityList, featuredUniversities } from './university-data';
import { useAuth } from '@/app/context/AuthContext';
import { Search, ChevronDown } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Định nghĩa các Interface ---
interface AdmissionScore {
    id: number;
    universityCode: string;
    universityName: string;
    majorName: string;
    majorCode: string;
    year: number;
    score: number;
    subjectCombination: string;
    note: string;
}

interface PageInfo {
    totalPages: number;
    totalElements: number;
    number: number;
}

interface UniversityOption {
    value: string;
    label: string;
}

// --- Component Chính ---
const AdmissionScorePage = () => {
    const { token } = useAuth();
    const [scores, setScores] = useState<AdmissionScore[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [filters, setFilters] = useState({
        universityCode: '',
        year: '2025',
    });
    const [currentPage, setCurrentPage] = useState(0);

    const fetchScores = useCallback(async (currentFilters: typeof filters, page: number) => {
        if (!currentFilters.universityCode && !currentFilters.year) {
            setScores([]);
            setPageInfo(null);
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', '20');
            if (currentFilters.universityCode) params.append('universityCode', currentFilters.universityCode);
            if (currentFilters.year) params.append('year', currentFilters.year);
            
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/v1/admission-scores/public/filter?${params.toString()}`, { headers });
            
            if (!response.ok) throw new Error('Không thể tải dữ liệu điểm chuẩn.');
            
            const result = await response.json();
            const scoreList = result.data?.content || (Array.isArray(result.data) ? result.data : []);
            const pageDetails = result.data?.content ? { totalPages: result.data.totalPages, totalElements: result.data.totalElements, number: result.data.number } : null;

            setScores(scoreList.map(item => ({...item, combination: item.subjectCombination})));
            setPageInfo(pageDetails);

            if (scoreList.length === 0) {
                 toast.info("Không tìm thấy kết quả phù hợp.");
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
            setScores([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchScores(filters, currentPage);
    }, [currentPage, filters, fetchScores]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchScores(filters, 0);
    };

    const handleQuickFilter = (code: string) => {
        setFilters({ universityCode: code, year: '2025' });
        setCurrentPage(0);
    };
    
    return (
        <section className="pb-12 pt-28">
            <ToastContainer />
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Tra cứu Điểm chuẩn Đại học</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Công cụ tra cứu điểm chuẩn chính xác và nhanh chóng nhất.</p>
                </div>
                
                <form onSubmit={handleSearch} className="bg-white dark:bg-dark p-6 rounded-xl shadow-lg mb-10 border dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        {/* SỬA ĐỔI: Sử dụng SearchableSelect mới */}
                        <SearchableSelect
                            label="Trường Đại học"
                            options={universityList.map(u => ({ value: u.code, label: `${u.code} - ${u.name}` }))}
                            value={filters.universityCode}
                            onChange={(value) => setFilters(prev => ({ ...prev, universityCode: value }))}
                        />
                        <SelectField name="year" label="Năm" value={filters.year} onChange={(e) => setFilters(prev => ({...prev, year: e.target.value}))} options={[2025, 2024, 2023, 2022, 2021].map(y => ({value: y, label: String(y)}))} />
                        <button type="submit" className="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center transition w-full">
                            <Search className="h-5 w-5 mr-2"/>
                            Tra cứu
                        </button>
                    </div>
                </form>

                 <div className="mb-12">
                    <p className="text-center font-semibold text-gray-700 dark:text-gray-300 mb-4">Hoặc chọn nhanh các trường hàng đầu</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {featuredUniversities.map(uni => (
                            <button key={uni.code} onClick={() => handleQuickFilter(uni.code)} className={`px-4 py-2 border rounded-full text-sm transition ${filters.universityCode === uni.code ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-dark dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {uni.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-dark p-6 rounded-xl shadow-lg border dark:border-gray-700 min-h-[300px]">
                    {isLoading ? <div className="text-center py-10">Đang tìm kiếm...</div> : (
                        scores.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trường</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngành</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổ hợp</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Điểm</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark dark:divide-gray-700">
                                            {scores.map(score => (
                                                <tr key={score.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{score.universityCode} - {score.universityName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{score.majorCode} - {score.majorName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{score.subjectCombination}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{score.score}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{score.note}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {pageInfo && pageInfo.totalPages > 1 && (
                                     <Pagination pageInfo={pageInfo} onPageChange={setCurrentPage} />
                                )}
                            </>
                        ) : <div className="text-center py-10 text-gray-500">Không có dữ liệu. Vui lòng chọn tiêu chí để tra cứu.</div>
                    )}
                </div>
            </div>
        </section>
    );
};

// --- Component con cho UI ---
// THAY ĐỔI: Component mới cho ô chọn có tìm kiếm
const SearchableSelect = ({ label, options, value, onChange }: { label: string, options: UniversityOption[], value: string, onChange: (value: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col relative" ref={wrapperRef}>
            <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white flex justify-between items-center text-left"
                >
                    <span className="truncate">{selectedOption ? selectedOption.label : "Chọn trường..."}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-dark border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder="Tìm kiếm trường..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 border-b dark:border-gray-700 bg-transparent focus:outline-none"
                            />
                        </div>
                        <ul>
                            {filteredOptions.length > 0 ? filteredOptions.map(option => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    {option.label}
                                </li>
                            )) : (
                                <li className="px-4 py-2 text-gray-500">Không tìm thấy</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const SelectField = ({ label, name, options, ...props }: {label: string, name: string, options: {value: string | number, label: string}[], [key: string]: any}) => (
     <div className="flex flex-col">
        <label htmlFor={name} className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <select name={name} id={name} {...props} className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white">
            <option value="">Tất cả</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const Pagination = ({ pageInfo, onPageChange }: { pageInfo: PageInfo, onPageChange: (page: number) => void }) => {
    const { totalPages, number: currentPage } = pageInfo;
    const renderPageNumbers = () => {
        const pageNumbers: JSX.Element[] = [];
        for (let i = 0; i < totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-4 py-2 text-sm font-medium border rounded-md ${ currentPage === i ? 'bg-primary text-white border-primary z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-dark dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'}`}
                >
                    {i + 1}
                </button>
            );
        }
        return pageNumbers;
    };
    return (
        <div className="flex justify-center items-center space-x-1 mt-8">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 dark:bg-dark dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Trước
            </button>
            {renderPageNumbers()}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 dark:bg-dark dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                Sau
            </button>
        </div>
    );
};

export default AdmissionScorePage;

