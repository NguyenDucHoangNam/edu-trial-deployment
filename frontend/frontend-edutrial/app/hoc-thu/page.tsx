// app/hoc-thu/page.tsx

"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, BookCopy, Building2 } from 'lucide-react';

// --- Định nghĩa Interfaces ---
interface UniversityInfo {
    id: number;
    name: string;
    logoUrl: string | null;
}

interface TrialProgram {
    id: number;
    name: string;
    description: string;
    coverImageUrl: string | null;
    university: UniversityInfo;
}

interface PageInfo {
    totalPages: number;
    totalElements: number;
    number: number; // Trang hiện tại
    last: boolean; // Có phải trang cuối không
}

// --- Component Card cho mỗi khóa học ---
const ProgramCard = ({ program }: { program: TrialProgram }) => (
    <Link href={`/hoc-thu/chi-tiet/${program.id}`} className="block group bg-white dark:bg-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative w-full h-48">
            <Image 
                src={program.coverImageUrl || "https://placehold.co/600x400/3498db/ffffff?text=Khóa+Học"} 
                alt={`Ảnh bìa khóa học ${program.name}`} 
                layout="fill" 
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
                unoptimized
            />
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex items-start gap-3 mb-3">
                <Image 
                    src={program.university.logoUrl || "https://placehold.co/40x40/cccccc/ffffff?text=Logo"} 
                    alt={`Logo ${program.university.name}`} 
                    width={40} 
                    height={40} 
                    className="rounded-full border object-contain flex-shrink-0"
                    unoptimized
                />
                <div>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{program.university.name}</p>
                     <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{program.name}</h3>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow h-16 overflow-hidden">{program.description}</p>
            <div className="mt-4 pt-3 border-t dark:border-gray-700 text-right">
                <span className="text-sm font-semibold text-primary">Xem chi tiết &rarr;</span>
            </div>
        </div>
    </Link>
);

// --- Component Chính ---
const AllTrialProgramsPage = () => {
    const { token } = useAuth();
    const [programs, setPrograms] = useState<TrialProgram[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        programName: '',
        universityName: '',
        majorName: '',
    });
    const [activeFilters, setActiveFilters] = useState(filters);
    const [currentPage, setCurrentPage] = useState(0);

    const fetchPrograms = useCallback(async (currentFilters: typeof filters, page: number, loadMore = false) => {
        if(!loadMore) setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', '9');
            if (currentFilters.programName) params.append('programName', currentFilters.programName);
            if (currentFilters.universityName) params.append('universityName', currentFilters.universityName);
            if (currentFilters.majorName) params.append('majorName', currentFilters.majorName);
            params.append('sort', 'name,asc');
            
            const headers: HeadersInit = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`/api/v1/trial-programs/public/filter?${params.toString()}`, { headers });
            if (!response.ok) throw new Error('Không thể tải danh sách khóa học thử.');
            
            const result = await response.json();
            const programList = result.data?.content || [];

            if (result.success && Array.isArray(programList)) {
                setPrograms(prev => loadMore ? [...prev, ...programList] : programList);
                setPageInfo({
                    totalPages: result.data.totalPages,
                    totalElements: result.data.totalElements,
                    number: result.data.number,
                    last: result.data.last,
                });
            } else {
                setPrograms([]);
                setPageInfo(null);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchPrograms(activeFilters, currentPage, currentPage > 0);
    }, [activeFilters, currentPage, fetchPrograms]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        setActiveFilters(filters);
    };
    
    const handleLoadMore = () => {
        if (!pageInfo || pageInfo.last) return;
        setCurrentPage(prev => prev + 1);
    }

    return (
        <section className="pb-12 pt-28 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer />
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Khám phá các Khóa học thử</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Trải nghiệm miễn phí các chương trình đào tạo từ những trường đại học hàng đầu.</p>
                </div>
                
                <form onSubmit={handleSearch} className="bg-white dark:bg-dark p-6 rounded-xl shadow-lg mb-10 border dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="lg:col-span-2">
                             <label htmlFor="programName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tên khóa học / Tên trường</label>
                             <input type="text" id="programName" name="programName" placeholder="VD: Trí tuệ nhân tạo, FPT..." value={filters.programName} onChange={(e) => setFilters({...filters, programName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600"/>
                        </div>
                         <div>
                             <label htmlFor="majorName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ngành học liên quan</label>
                             <input type="text" id="majorName" name="majorName" placeholder="VD: Khoa học máy tính..." value={filters.majorName} onChange={(e) => setFilters({...filters, majorName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600"/>
                        </div>
                        <button type="submit" className="bg-primary hover:bg-opacity-90 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center transition w-full">
                            <Search className="h-5 w-5 mr-2"/>
                            Tìm kiếm
                        </button>
                    </div>
                </form>

                {isLoading && programs.length === 0 ? <div className="text-center py-10">Đang tải...</div> : (
                    programs.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {programs.map(program => <ProgramCard key={program.id} program={program} />)}
                            </div>
                            {pageInfo && !pageInfo.last && (
                                <div className="mt-12 text-center">
                                    <button onClick={handleLoadMore} disabled={isLoading} className="rounded-md bg-white dark:bg-dark border dark:border-gray-600 px-6 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                                        {isLoading ? 'Đang tải...' : 'Tải thêm'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : <div className="text-center py-20 text-gray-500">Không tìm thấy khóa học thử nào phù hợp.</div>
                )}
            </div>
        </section>
    );
};

export default AllTrialProgramsPage;
