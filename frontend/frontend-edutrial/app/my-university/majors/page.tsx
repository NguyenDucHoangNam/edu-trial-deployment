// app/my-university/majors/page.tsx

"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Interfaces ---
interface Major {
    id: number;
    name: string;
    description?: string;
    imageUrl: string | null;
    facultyId: number;
    facultyName: string;
}

interface Faculty {
    id: number;
    name: string;
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


const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NhY2FjYSI+PHBhdGggZD0iTTQgNGg0djRoLTR6bTYgMGg0djRoLTR6bTYgMGg0djRoLTR6bS02IDZoNHY0aC00em02IDBoNHY0aC00ek00IDEwaDR2NGgtNHptMTIgMGg0djRoLTR6bS02IDZoNHY0aC00ek00IDE2aDR2NGgtNHptMTIgMGg0djRoLTR6Ii8+PC9zdmc+";

// --- Component Chính ---
const MajorsManagementPage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    const [majors, setMajors] = useState<Major[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentMajor, setCurrentMajor] = useState<Partial<Major>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [majorToDelete, setMajorToDelete] = useState<Major | null>(null);

    const fetchMajors = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/v1/majors", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) {
                 const errorResult = await response.json().catch(() => ({ message: "Không thể tải danh sách ngành học." }));
                 throw new Error(errorResult.message);
            }
            const result = await response.json();
            
            if (result.success && Array.isArray(result.data)) {
                setMajors(result.data);
            } else {
                setMajors([]);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
            setMajors([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMajors();
    }, [fetchMajors]);

    const groupedMajors = majors.reduce((acc, major) => {
        (acc[major.facultyName] = acc[major.facultyName] || []).push(major);
        return acc;
    }, {} as Record<string, Major[]>);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentMajor({ name: '', description: '', facultyId: undefined });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (major: Major) => {
        setModalMode('edit');
        setCurrentMajor(major);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (major: Major) => {
        setMajorToDelete(major);
        setIsDeleteModalOpen(true);
    };
    
    const handleFormSubmit = async (formData: FormData) => {
        if (!token) return;
        const isCreating = modalMode === 'create';
        const url = isCreating ? "/api/v1/majors" : `/api/v1/majors/${currentMajor.id}`;
        const method = isCreating ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Thao tác thất bại.");
            
            toast.success(result.message);
            setIsModalOpen(false);
            fetchMajors();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
        }
    };

    const handleDeleteMajor = async () => {
        if (!majorToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/majors/${majorToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
             if (!response.ok) {
                 const result = await response.json().catch(() => ({message: "Xóa ngành thất bại."}));
                 throw new Error(result.message);
            }
            toast.success("Xóa ngành học thành công!");
            setIsDeleteModalOpen(false);
            fetchMajors();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
        }
    };
    
    // ... Phần JSX để render giữ nguyên như cũ
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
                                <h2 className="text-xl font-semibold text-black dark:text-white">Danh sách Ngành học</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Thêm Ngành học</span>
                                </button>
                            </div>

                            {isLoading ? <p>Đang tải...</p> : (
                                <div className="space-y-8">
                                    {Object.keys(groupedMajors).length > 0 ? (
                                        Object.entries(groupedMajors).map(([facultyName, majorList]) => (
                                            <div key={facultyName}>
                                                <h3 className="text-lg font-semibold text-primary mb-4 border-b pb-2">{facultyName}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {majorList.map(major => (
                                                        <MajorCard key={major.id} major={major} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-500 py-10">Chưa có ngành học nào. Hãy thêm ngành học mới.</p>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <MajorModal isOpen={isModalOpen} mode={modalMode} majorData={currentMajor} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} token={token} />
            )}
             {isDeleteModalOpen && majorToDelete && (
                <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteMajor} majorName={majorToDelete.name} />
            )}
        </>
    );
};

// ... Các Component con (MajorCard, MajorModal, DeleteConfirmModal) giữ nguyên như cũ
const MajorCard = ({ major, onEdit, onDelete }: { major: Major, onEdit: (m: Major) => void, onDelete: (m: Major) => void }) => (
    <div className="border rounded-lg p-4 flex flex-col items-center text-center dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative w-full h-32 mb-4">
            <Image src={major.imageUrl || placeholderImage} alt={major.name} layout="fill" objectFit="cover" className="rounded-md" unoptimized/>
        </div>
        <h3 className="font-semibold text-lg dark:text-white flex-grow">{major.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10 overflow-hidden">{major.description}</p>
        <div className="mt-4 flex space-x-4">
            <button onClick={() => onEdit(major)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
            <button onClick={() => onDelete(major)} className="text-sm text-red-600 hover:text-red-800 font-medium">Xóa</button>
        </div>
    </div>
);

const MajorModal = ({ isOpen, mode, majorData, onClose, onSubmit, token }) => {
    const [currentMajor, setCurrentMajor] = useState(majorData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(majorData.imageUrl);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingFaculties, setIsLoadingFaculties] = useState(true);

    useEffect(() => {
        const fetchFaculties = async () => {
            if (!token) {
                toast.error("Lỗi xác thực, không thể tải danh sách khoa.");
                setIsLoadingFaculties(false);
                return;
            }
            
            setIsLoadingFaculties(true);
            try {
                const res = await fetch("/api/v1/my-faculties", { headers: { 'Authorization': `Bearer ${token}` } });
                
                if (!res.ok) {
                    throw new Error(`Lỗi từ server: ${res.status}`);
                }
                
                const result = await res.json();
                const facultyList = result.data?.content || result.data || result;
                
                if (Array.isArray(facultyList)) {
                    setFaculties(facultyList);
                    if (facultyList.length === 0) {
                        toast.warn("Không có khoa nào để chọn. Vui lòng tạo khoa trước.");
                    }
                } else {
                    setFaculties([]);
                }

            } catch (error) {
                console.error("Không thể tải danh sách khoa:", error);
                toast.error("Không thể tải danh sách khoa. Vui lòng thử lại.");
            } finally {
                setIsLoadingFaculties(false);
            }
        };

        if (isOpen) {
            fetchFaculties();
        }
    }, [isOpen, token]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!currentMajor.facultyId) {
            toast.error("Vui lòng chọn một khoa.");
            setIsSubmitting(false);
            return;
        }
        const formData = new FormData();
        const dataToSubmit = { name: currentMajor.name, description: currentMajor.description, facultyId: Number(currentMajor.facultyId) };
        const dataBlob = new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' });
        formData.append('majorData', dataBlob);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{mode === 'create' ? 'Tạo Ngành học mới' : 'Chỉnh sửa Ngành học'}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Tên ngành</label>
                        <input id="name" type="text" value={currentMajor.name || ''} onChange={(e) => setCurrentMajor({...currentMajor, name: e.target.value})} required className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 outline-none dark:border-form-strokedark dark:bg-form-input" />
                    </div>
                    <div>
                        <label htmlFor="facultyId" className="block text-sm font-medium mb-1">Thuộc khoa</label>
                        <select 
                            id="facultyId" 
                            value={currentMajor.facultyId || ''} 
                            onChange={(e) => setCurrentMajor({...currentMajor, facultyId: Number(e.target.value)})} 
                            required 
                            disabled={isLoadingFaculties}
                            className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 outline-none dark:border-form-strokedark dark:bg-form-input appearance-none"
                        >
                            <option value="" disabled>
                                {isLoadingFaculties ? 'Đang tải khoa...' : '-- Chọn khoa --'}
                            </option>
                            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea id="description" value={currentMajor.description || ''} onChange={(e) => setCurrentMajor({...currentMajor, description: e.target.value})} rows={3} className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 outline-none dark:border-form-strokedark dark:bg-form-input" />
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>
                        <Image src={imagePreview || placeholderImage} alt="Preview" width={100} height={100} className="w-24 h-24 rounded-md object-cover mb-3" unoptimized/>
                        <input type="file" accept="image/*" onChange={e => {
                            if(e.target.files?.[0]) {
                                const file = e.target.files[0];
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90 disabled:bg-gray-400">{isSubmitting ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
            </form>
        </div>
    );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, majorName }) => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa vĩnh viễn ngành <span className="font-semibold">"{majorName}"</span>?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
            </div>
        </div>
    </div>
);

export default MajorsManagementPage;