"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// --- Định nghĩa các Interface ---
interface University {
    id: number;
    name: string;
    logoUrl: string | null;
    address: string;
    introduction: string;
    majors: string[];
}

interface PageInfo {
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

// --- Props cho component Pagination ---
interface PaginationProps {
    pageInfo: PageInfo;
    onPageChange: (page: number) => void;
}


// --- Component Pagination ---
const Pagination: React.FC<PaginationProps> = ({ pageInfo, onPageChange }) => {
    const { totalPages, number: currentPage } = pageInfo;

    const renderPageNumbers = () => {
        const pageNumbers = [];
        // Logic hiển thị phức tạp hơn để tránh quá nhiều nút trang
        let startPage: number, endPage: number;
        if (totalPages <= 5) {
            // Hiển thị tất cả các trang nếu ít hơn hoặc bằng 5
            startPage = 0;
            endPage = totalPages -1;
        } else {
            // Logic phức tạp hơn cho nhiều trang
            if (currentPage <= 2) {
                startPage = 0;
                endPage = 4;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 5;
                endPage = totalPages - 1;
            } else {
                startPage = currentPage - 2;
                endPage = currentPage + 2;
            }
        }

        if (startPage > 0) {
            pageNumbers.push(
                <button key={0} onClick={() => onPageChange(0)} className="px-4 py-2 text-sm font-medium border rounded-md bg-white text-gray-700 border-gray-300 hover:bg-gray-100">
                    1
                </button>
            );
            if (startPage > 1) {
                pageNumbers.push(<span key="start-ellipsis" className="px-4 py-2">...</span>);
            }
        }


        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-4 py-2 text-sm font-medium border rounded-md ${currentPage === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                    {i + 1}
                </button>
            );
        }

        if (endPage < totalPages - 1) {
             if (endPage < totalPages - 2) {
                pageNumbers.push(<span key="end-ellipsis" className="px-4 py-2">...</span>);
            }
            pageNumbers.push(
                <button key={totalPages-1} onClick={() => onPageChange(totalPages-1)} className="px-4 py-2 text-sm font-medium border rounded-md bg-white text-gray-700 border-gray-300 hover:bg-gray-100">
                    {totalPages}
                </button>
            );
        }

        return pageNumbers;
    };


    return (
        <div className="flex justify-center items-center space-x-1 mt-10 pb-8">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Prev
            </button>
            {renderPageNumbers()}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
            </button>
        </div>
    );
};


// --- Component Chính ---
const DanhSachTruongPage = () => {
    // State để lưu danh sách trường và thông tin phân trang
    const [schools, setSchools] = useState<University[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // --- Cải tiến State cho bộ lọc ---
    // State để người dùng nhập liệu
    const [inputName, setInputName] = useState('');
    const [inputMajor, setInputMajor] = useState('');

    // State cho các giá trị lọc sẽ được gửi đi API
    const [activeNameFilter, setActiveNameFilter] = useState('');
    const [activeMajorFilter, setActiveMajorFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);

    const fetchUniversities = useCallback(async (page: number, name: string, major: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', '6'); // Lấy 6 trường mỗi trang
            if (name) params.append('name', name);
            if (major) params.append('major', major);

            const response = await fetch(`/api/v1/universities/public/filter?${params.toString()}`);
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: 'Không thể tải dữ liệu các trường.' }));
                 throw new Error(errorData.message || 'Lỗi mạng hoặc server không phản hồi');
            }

            const result = await response.json();
            if (result.success && result.data) {
                setSchools(result.data.content || []);
                setPageInfo({
                    totalPages: result.data.totalPages,
                    totalElements: result.data.totalElements,
                    number: result.data.number,
                    size: result.data.size,
                });
            } else {
                setSchools([]);
                setPageInfo(null);
                // Nếu API trả về success: false nhưng có message, hiển thị nó
                 if(result.message) setError(result.message);
            }
        } catch (error: any) {
            console.error("Lỗi khi fetchUniversities:", error);
            setError(error.message || "Đã xảy ra lỗi không mong muốn.");
            setSchools([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect để gọi API chỉ khi các giá trị lọc "active" hoặc trang thay đổi
    useEffect(() => {
        fetchUniversities(currentPage, activeNameFilter, activeMajorFilter);
    }, [currentPage, activeNameFilter, activeMajorFilter, fetchUniversities]);

    // Hàm xử lý khi nhấn nút tìm kiếm
    const handleSearch = () => {
        setCurrentPage(0); // Luôn quay về trang đầu tiên khi có bộ lọc mới
        setActiveNameFilter(inputName.trim()); // Áp dụng giá trị từ ô input vào bộ lọc active
        setActiveMajorFilter(inputMajor.trim()); // Áp dụng giá trị từ ô input vào bộ lọc active
    };
    
    // Hàm xử lý nhấn Enter trên input
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="pb-[20px] pt-[120px]">
            <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg shadow-md">
                <div className="text-center mb-12 pt-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Khám phá các Trường Đại học Đối tác
                    </h1>
                    <p className="text-lg text-gray-700">
                        Tìm hiểu thông tin và các khóa học thử từ những trường đại học hàng đầu.
                    </p>
                </div>

                {/* --- BỘ LỌC ĐÃ SỬA --- */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">

                        {/* THAY ĐỔI TỪ SELECT SANG INPUT */}
                        <div className="flex flex-col md:col-span-3">
                            <label htmlFor="major-input" className="mb-2 text-sm font-medium text-gray-700">Ngành</label>
                            <input
                                type="text"
                                id="major-input"
                                placeholder="Nhập tên ngành (VD: Khoa học Máy tính)"
                                value={inputMajor}
                                onChange={(e) => setInputMajor(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            />
                        </div>

                        <div className="flex flex-col md:col-span-2">
                            <label htmlFor="school-code-input" className="mb-2 text-sm font-medium text-gray-700">Tên hoặc Mã Trường</label>
                            <input
                                type="text"
                                id="school-code-input"
                                placeholder="Nhập mã trường (VD: FPT)"
                                value={inputName}
                                onChange={(e) => setInputName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center transition duration-150 ease-in-out md:col-span-1 w-full"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden md:inline">Tìm kiếm</span>
                        </button>
                    </div>
                </div>

                {/* --- DANH SÁCH VÀ PHÂN TRANG --- */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                     <div className="text-center py-12 text-red-600 bg-red-50 p-4 rounded-md">
                        <p><strong>Lỗi:</strong> {error}</p>
                     </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {schools.length > 0 ? schools.map((school) => (
                                <Link key={school.id} href={`/chi-tiet-truong/${school.id}`} passHref>
                                    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 cursor-pointer h-full flex flex-col">
                                        <img src={school.logoUrl || "https://via.placeholder.com/400x250?text=School+Image"} alt={`Hình ảnh trường ${school.name}`} className="w-full h-56 object-cover" />
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2 min-h-[56px]">{school.name}</h3>
                                            <p className="text-gray-600 text-sm mb-1"><span className="font-medium">Địa điểm:</span> {school.address}</p>
                                            <p className="text-gray-600 text-sm mb-3 h-20 overflow-hidden text-ellipsis">
                                                <span className="font-medium">Mô tả:</span> {school.introduction ? school.introduction.substring(0, 100) + '...' : 'Chưa có mô tả.'}
                                            </p>
                                            <div className="mb-3">
                                                <span className="font-medium text-gray-700 text-sm">Ngành nổi bật:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {school.majors && school.majors.slice(0, 3).map((major, index) => (
                                                        <span key={`${major}-${index}`} className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-full">{major}</span>
                                                    ))}
                                                    {(!school.majors || school.majors.length === 0) && <span className="text-xs text-gray-500">Chưa có thông tin.</span>}
                                                </div>
                                            </div>
                                            <div className="mt-auto pt-3">
                                                <span className="inline-block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out">
                                                    Xem chi tiết
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <p className="col-span-full text-center text-gray-700 py-12">Không tìm thấy trường đại học nào phù hợp với tiêu chí của bạn.</p>
                            )}
                        </div>

                        {pageInfo && pageInfo.totalPages > 1 && (
                            <Pagination pageInfo={pageInfo} onPageChange={setCurrentPage} />
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default DanhSachTruongPage;