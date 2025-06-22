// app/my-university/tuition/page.tsx

"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Định nghĩa Interface & Dữ liệu Menu ---
interface TuitionProgram {
    id: number;
    programName: string;
    feeAmount: number | string;
    description?: string;
}

const navLinks = [
    { name: "Thông tin chung", href: "/my-university" },
    { name: "Ngành học", href: "/my-university/majors" },
    { name: "Khoa", href: "/my-university/faculties" },
    { name: "Học Phí", href: "/my-university/tuition" },
    { name: "Học bổng", href: "/my-university/scholarships" },
    { name: "Sự kiện", href: "/my-university/events" },
    { name: "Đời sống sinh viên", href: "/my-university/student-life" },
    { name: "Chương trình học thử", href: "/my-university/trial-programs" },
];

// --- Component Chính ---
const TuitionManagementPage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    const [programs, setPrograms] = useState<TuitionProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentProgram, setCurrentProgram] = useState<Partial<TuitionProgram>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<TuitionProgram | null>(null);

    // app/my-university/tuition/page.tsx

// ... trong component TuitionManagementPage

const fetchTuitionPrograms = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
        const response = await fetch("/api/v1/tuition-programs/my-university", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            const errorResult = await response.json().catch(() => ({ message: "Không thể tải danh sách học phí." }));
            throw new Error(errorResult.message);
        }

        const result = await response.json();

        // Thêm dòng này để kiểm tra dữ liệu gốc trong Console (F12)
        console.log("DỮ LIỆU GỐC TỪ API HỌC PHÍ:", result);

        // --- LOGIC XỬ LÝ DỮ LIỆU LINH HOẠT HƠN ---
        let programsList = [];

        if (result.success) {
            // Ưu tiên kiểm tra cấu trúc phân trang trước (data.content)
            if (result.data && Array.isArray(result.data.content)) {
                programsList = result.data.content;
            } 
            // Nếu không, kiểm tra cấu trúc mảng trực tiếp trong data
            else if (Array.isArray(result.data)) {
                programsList = result.data;
            }
        }
        
        setPrograms(programsList);
        // --- KẾT THÚC ---

    } catch (error) {
        toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
        setPrograms([]);
    } finally {
        setIsLoading(false);
    }
}, [token]);

    useEffect(() => {
        fetchTuitionPrograms();
    }, [fetchTuitionPrograms]);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentProgram({ programName: '', feeAmount: '', description: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (program: TuitionProgram) => {
        setModalMode('edit');
        setCurrentProgram(program);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (program: TuitionProgram) => {
        setProgramToDelete(program);
        setIsDeleteModalOpen(true);
    };
    
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token || !currentProgram.programName || !currentProgram.feeAmount) {
            toast.error("Vui lòng điền đầy đủ Tên chương trình và Mức phí.");
            return;
        }

        const isCreating = modalMode === 'create';
        const url = isCreating ? "/api/v1/tuition-programs" : `/api/v1/tuition-programs/${currentProgram.id}`;
        const method = isCreating ? 'POST' : 'PUT';
        
        const body = {
            programName: currentProgram.programName,
            feeAmount: Number(currentProgram.feeAmount),
            description: currentProgram.description,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json', // Gửi dưới dạng JSON
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(body), // Chuyển object thành chuỗi JSON
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Thao tác thất bại.");
            
            toast.success(result.message);
            setIsModalOpen(false);
            fetchTuitionPrograms();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
        }
    };

    const handleDeleteProgram = async () => {
        if (!programToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/tuition-programs/${programToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const result = await response.json().catch(() => ({message: "Xóa thất bại."}));
                 throw new Error(result.message);
            }
            toast.success("Xóa chương trình học phí thành công!");
            setIsDeleteModalOpen(false);
            fetchTuitionPrograms();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
        }
    };
    
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <section className="py-16 md:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6">Quản lý trường</h1>
                        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                             <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {navLinks.map((tab) => (
                                    <Link key={tab.name} href={tab.href} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${ pathname === tab.href ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600' }`}>
                                        {tab.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        
                        <main className="bg-white dark:bg-dark p-6 sm:p-8 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-black dark:text-white">Danh sách chương trình học phí</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Thêm chương trình</span>
                                </button>
                            </div>

                            {isLoading ? <p>Đang tải...</p> : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Tên chương trình</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Mức phí (VND)</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Mô tả</th>
                                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark dark:divide-gray-700">
                                            {programs.length > 0 ? programs.map((program) => (
                                                <tr key={program.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{program.programName}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Intl.NumberFormat('vi-VN').format(Number(program.feeAmount))}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-sm truncate">{program.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                        <button onClick={() => handleOpenEditModal(program)} className="text-primary hover:text-indigo-900">Sửa</button>
                                                        <button onClick={() => handleOpenDeleteModal(program)} className="text-red-600 hover:text-red-900">Xóa</button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">Chưa có chương trình học phí nào.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <form onSubmit={handleFormSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{modalMode === 'create' ? 'Tạo chương trình học phí' : 'Chỉnh sửa chương trình'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="programName" className="block text-sm font-medium mb-1">Tên chương trình</label>
                                <input id="programName" type="text" value={currentProgram.programName || ''} onChange={(e) => setCurrentProgram({...currentProgram, programName: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                            </div>
                             <div>
                                <label htmlFor="feeAmount" className="block text-sm font-medium mb-1">Mức phí</label>
                                <input id="feeAmount" type="number" step="0.01" value={currentProgram.feeAmount || ''} onChange={(e) => setCurrentProgram({...currentProgram, feeAmount: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả</label>
                                <textarea id="description" value={currentProgram.description || ''} onChange={(e) => setCurrentProgram({...currentProgram, description: e.target.value})} rows={4} className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md">Hủy</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">Lưu</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && programToDelete && (
                 <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity ${isDeleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
                        <p>Bạn có chắc chắn muốn xóa chương trình <span className="font-semibold">"{programToDelete.programName}"</span>?</p>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                            <button onClick={handleDeleteProgram} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TuitionManagementPage;