// app/my-university/scholarships/page.tsx

"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Định nghĩa Interface & Dữ liệu Menu ---
interface ScholarshipProgram {
    id: number;
    name: string;
    criteriaDescription: string;
    valueDescription: string;
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
const ScholarshipsManagementPage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentProgram, setCurrentProgram] = useState<Partial<ScholarshipProgram>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<ScholarshipProgram | null>(null);

    // --- SỬA LỖI Ở HÀM NÀY ---
    const fetchScholarshipPrograms = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/v1/scholarship-programs/my-university", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Không thể tải danh sách học bổng.");
            
            const result = await response.json();

            // Lấy danh sách học bổng từ `result.data.content`
            const programsList = result.data?.content;
            
            if (result.success && Array.isArray(programsList)) {
                setPrograms(programsList);
            } else {
                setPrograms([]);
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
            setPrograms([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);
    // --- KẾT THÚC SỬA LỖI ---


    useEffect(() => {
        fetchScholarshipPrograms();
    }, [fetchScholarshipPrograms]);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentProgram({ name: '', criteriaDescription: '', valueDescription: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (program: ScholarshipProgram) => {
        setModalMode('edit');
        setCurrentProgram(program);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (program: ScholarshipProgram) => {
        setProgramToDelete(program);
        setIsDeleteModalOpen(true);
    };
    
    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!token || !currentProgram.name) {
            toast.error("Vui lòng điền Tên học bổng.");
            return;
        }

        const isCreating = modalMode === 'create';
        const url = isCreating ? "/api/v1/scholarship-programs" : `/api/v1/scholarship-programs/${currentProgram.id}`;
        const method = isCreating ? 'POST' : 'PUT';
        
        const body = {
            name: currentProgram.name,
            criteriaDescription: currentProgram.criteriaDescription,
            valueDescription: currentProgram.valueDescription,
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Thao tác thất bại.");
            
            toast.success(result.message);
            setIsModalOpen(false);
            fetchScholarshipPrograms();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
        }
    };

    const handleDeleteProgram = async () => {
        if (!programToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/scholarship-programs/${programToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const result = await response.json().catch(() => ({message: "Xóa thất bại."}));
                 throw new Error(result.message);
            }
            toast.success("Xóa chương trình học bổng thành công!");
            setIsDeleteModalOpen(false);
            fetchScholarshipPrograms();
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
                             <nav className="-mb-px flex space-x-6 overflow-x-auto">
                                {navLinks.map((tab) => (
                                    <Link key={tab.name} href={tab.href} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${ pathname === tab.href ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600' }`}>
                                        {tab.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        
                        <main className="bg-white dark:bg-dark p-6 sm:p-8 rounded-lg shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-black dark:text-white">Danh sách chương trình học bổng</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Thêm học bổng</span>
                                </button>
                            </div>

                            {isLoading ? <p>Đang tải...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {programs.length > 0 ? programs.map((program) => (
                                       <div key={program.id} className="border rounded-lg p-6 flex flex-col dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                            <h3 className="text-lg font-bold text-primary mb-2">{program.name}</h3>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 flex-grow">
                                                <div>
                                                    <p className="font-semibold">Tiêu chí:</p>
                                                    <p>{program.criteriaDescription}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Giá trị:</p>
                                                    <p>{program.valueDescription}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t dark:border-gray-600 flex justify-end space-x-4">
                                                <button onClick={() => handleOpenEditModal(program)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                                                <button onClick={() => handleOpenDeleteModal(program)} className="text-sm text-red-600 hover:text-red-800 font-medium">Xóa</button>
                                            </div>
                                       </div>
                                    )) : (
                                        <div className="col-span-full py-10 text-center text-gray-500">Chưa có chương trình học bổng nào.</div>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <form onSubmit={handleFormSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">{modalMode === 'create' ? 'Tạo chương trình học bổng' : 'Chỉnh sửa chương trình'}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">Tên học bổng</label>
                                <input id="name" type="text" value={currentProgram.name || ''} onChange={(e) => setCurrentProgram({...currentProgram, name: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                            </div>
                             <div>
                                <label htmlFor="criteriaDescription" className="block text-sm font-medium mb-1">Mô tả tiêu chí</label>
                                <textarea id="criteriaDescription" value={currentProgram.criteriaDescription || ''} onChange={(e) => setCurrentProgram({...currentProgram, criteriaDescription: e.target.value})} rows={4} className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                            </div>
                            <div>
                                <label htmlFor="valueDescription" className="block text-sm font-medium mb-1">Mô tả giá trị</label>
                                <textarea id="valueDescription" value={currentProgram.valueDescription || ''} onChange={(e) => setCurrentProgram({...currentProgram, valueDescription: e.target.value})} rows={4} className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
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
                        <p>Bạn có chắc chắn muốn xóa học bổng <span className="font-semibold">"{programToDelete.name}"</span>?</p>
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

export default ScholarshipsManagementPage;

