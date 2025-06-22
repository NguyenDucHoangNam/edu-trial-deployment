// app/my-university/trial-programs/page.tsx

"use client";

import React, { useState, useEffect, FormEvent, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Định nghĩa Interface & Dữ liệu Menu ---
interface TrialProgram {
    id: number;
    name: string;
    description: string;
    coverImageUrl: string | null;
}

const navLinks = [
    { name: "Thông tin chung", href: "/my-university" },
    { name: "Quản lý khoa", href: "/my-university/faculties" },
    { name: "Quản lý ngành", href: "/my-university/majors" },
    { name: "Quản lý học phí", href: "/my-university/tuition" },
    { name: "Quản lý học bổng", href: "/my-university/scholarships" },
    { name: "Quản lý sự kiện", href: "/my-university/events" },
    { name: "Chương trình học thử", href: "/my-university/trial-programs" },
];

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NhY2FjYSI+PHBhdGggZD0iTTQgNGg0djRoLTR6bTYgMGg0djRoLTR6bTYgMGg0djRoLTR6bS02IDZoNHY0aC00em02IDBoNHY0aC00ek00IDEwaDR2NGgtNHptMTIgMGg0djRoLTR6bS02IDZoNHY0aC00ek00IDE2aDR2NGgtNHptMTIgMGg0djRoLTR6Ii8+PC9zdmc+";

// --- Component Chính ---
const TrialProgramsPage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    const [programs, setPrograms] = useState<TrialProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentProgram, setCurrentProgram] = useState<Partial<TrialProgram>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<TrialProgram | null>(null);

    const fetchTrialPrograms = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/v1/trial-programs/my-programs", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Không thể tải danh sách chương trình.");
            
            const result = await response.json();
            const programList = result.data?.content || result.data || [];

            if (result.success && Array.isArray(programList)) {
                setPrograms(programList);
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

    useEffect(() => {
        fetchTrialPrograms();
    }, [fetchTrialPrograms]);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentProgram({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (program: TrialProgram) => {
        setModalMode('edit');
        setCurrentProgram(program);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (program: TrialProgram) => {
        setProgramToDelete(program);
        setIsDeleteModalOpen(true);
    };
    
    const handleFormSubmit = async (formData: FormData) => {
        if (!token) return;
        const isCreating = modalMode === 'create';
        const url = isCreating ? "/api/v1/trial-programs" : `/api/v1/trial-programs/${currentProgram.id}`;
        const method = isCreating ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Thao tác thất bại.");
            
            toast.success(result.message);
            setIsModalOpen(false);
            fetchTrialPrograms();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
        }
    };

    const handleDeleteProgram = async () => {
        if (!programToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/trial-programs/${programToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const result = await response.json().catch(() => ({message: "Xóa thất bại."}));
                 throw new Error(result.message);
            }
            toast.success("Xóa chương trình thành công!");
            setIsDeleteModalOpen(false);
            fetchTrialPrograms();
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
                                <h2 className="text-xl font-semibold text-black dark:text-white">Danh sách Chương trình học thử</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Thêm chương trình</span>
                                </button>
                            </div>

                            {isLoading ? <p>Đang tải...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {programs.length > 0 ? programs.map((program) => (
                                       <ProgramCard key={program.id} program={program} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                                    )) : (
                                        <div className="col-span-full py-10 text-center text-gray-500">Chưa có chương trình học thử nào.</div>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <ProgramModal isOpen={isModalOpen} mode={modalMode} programData={currentProgram} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} />
            )}
            {isDeleteModalOpen && programToDelete && (
                <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteProgram} programName={programToDelete.name} />
            )}
        </>
    );
};

// --- Các Component con ---
const ProgramCard = ({ program, onEdit, onDelete }: { program: TrialProgram, onEdit: (p: TrialProgram) => void, onDelete: (p: TrialProgram) => void }) => {
    
    // Hàm xử lý sự kiện click cho các nút, ngăn không cho Link cha bị kích hoạt
    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Ngăn hành vi mặc định của Link
        e.stopPropagation(); // Ngăn sự kiện nổi bọt lên thẻ Link cha
        onEdit(program);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(program);
    };

    return (
        // Bọc toàn bộ thẻ bằng component Link
        <Link href={`/my-university/trial-programs/${program.id}`} className="block group border rounded-lg flex flex-col dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
            <div className="relative w-full h-48">
                 <Image src={program.coverImageUrl || placeholderImage} alt={program.name} layout="fill" objectFit="cover" unoptimized/>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-primary mb-2 flex-grow group-hover:underline">{program.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 h-20 overflow-hidden">{program.description}</p>
                <div className="mt-auto pt-4 border-t dark:border-gray-600 flex justify-end space-x-4">
                    {/* Sử dụng các hàm xử lý click đã được cập nhật */}
                    <button onClick={handleEditClick} className="text-sm text-blue-600 hover:text-blue-800 font-medium z-10 relative">Sửa</button>
                    <button onClick={handleDeleteClick} className="text-sm text-red-600 hover:text-red-800 font-medium z-10 relative">Xóa</button>
                </div>
            </div>
        </Link>
    );
};


const ProgramModal = ({ isOpen, mode, programData, onClose, onSubmit }) => {
    const [currentProgram, setCurrentProgram] = useState(programData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(programData.coverImageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const dataToSubmit = { name: currentProgram.name, description: currentProgram.description };
        const dataBlob = new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' });
        
        const formData = new FormData();
        formData.append('data', dataBlob); 
        
        if (imageFile) {
            formData.append('coverImageFile', imageFile);
        }
        
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">{mode === 'create' ? 'Tạo chương trình học thử' : 'Chỉnh sửa chương trình'}</h3>
                <div className="space-y-4">
                     <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium mb-2 w-full">Ảnh bìa</label>
                        <div className="w-full aspect-video relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                             <Image src={imagePreview || placeholderImage} alt="Preview" layout="fill" objectFit="cover" unoptimized/>
                        </div>
                        <input type="file" accept="image/*" required={mode === 'create'} onChange={e => {
                            if(e.target.files?.[0]) {
                                const file = e.target.files[0];
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }} className="mt-3 text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Tên chương trình</label>
                        <input id="name" type="text" value={currentProgram.name || ''} onChange={(e) => setCurrentProgram({...currentProgram, name: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                        <textarea id="description" value={currentProgram.description || ''} onChange={(e) => setCurrentProgram({...currentProgram, description: e.target.value})} rows={5} className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">{isSubmitting ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
            </form>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, programName }) => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa chương trình <span className="font-semibold">"{programName}"</span>?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
            </div>
        </div>
    </div>
);

export default TrialProgramsPage;
