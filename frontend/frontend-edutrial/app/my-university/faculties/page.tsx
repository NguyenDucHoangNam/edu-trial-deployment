// app/my-university/faculties/page.tsx

"use client";

import { useState, useEffect, FormEvent, ChangeEvent, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Định nghĩa các Interface ---

interface Faculty {
    id: number;
    name: string;
    description?: string; // Sửa lại cho phép optional
    imageUrl: string | null;
}

// Interface cho dữ liệu phân trang từ backend
interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // trang hiện tại
    size: number;
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


const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTQgNGg0djRoLTR6bTYgMGg0djRoLTR6bTYgMGg0djRoLTR6bS02IDZoNHY0aC00em02IDBoNHY0aC00ek00IDEwaDR2NGgtNHptMTIgMGg0djRoLTR6bS02IDZoNHY0aC00ek00IDE2aDR2NGgtNHptMTIgMGg0djRoLTR6Ii8+PC9zdmc+";

// --- Component Chính ---
const FacultiesManagementPage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    
    // --- CẢI TIẾN: State sẽ lưu cả object Page để tiện cho việc phân trang sau này ---
    const [facultyPage, setFacultyPage] = useState<Page<Faculty> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentFaculty, setCurrentFaculty] = useState<Partial<Faculty>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);

    const fetchMyFaculties = useCallback(async (page = 0) => {
        if (!token) return;
        setIsLoading(true);
        try {
            // Thêm tham số phân trang vào URL
            const response = await fetch(`/api/v1/my-faculties?page=${page}&size=6`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                 const errorResult = await response.json().catch(() => ({ message: "Không thể tải danh sách khoa." }));
                 throw new Error(errorResult.message);
            }
            const result = await response.json();

            // --- SỬA LỖI: Gán đúng object Page vào state ---
            if (result.success && result.data) {
                setFacultyPage(result.data);
            } else {
                setFacultyPage(null); // Set là null nếu không có data
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
            setFacultyPage(null);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMyFaculties();
    }, [fetchMyFaculties]);

    // Các hàm mở modal
    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentFaculty({ name: '', description: '' });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (faculty: Faculty) => {
        setModalMode('edit');
        setCurrentFaculty(faculty);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (faculty: Faculty) => {
        setFacultyToDelete(faculty);
        setIsDeleteModalOpen(true);
    };
    
    // --- SỬA LỖI: Logic submit form đã được viết lại cho chính xác ---
    const handleFormSubmit = async (formData: FormData) => {
        if (!token) return;

        const isCreating = modalMode === 'create';
        const url = isCreating 
            ? "/api/v1/my-faculties" 
            : `/api/v1/my-faculties/${currentFaculty.id}`;
        const method = isCreating ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    // QUAN TRỌNG: KHÔNG set 'Content-Type' ở đây.
                    // Trình duyệt sẽ tự động thêm 'multipart/form-data' với boundary cần thiết.
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                // Xử lý lỗi validation từ server
                if (result.validationErrors) {
                   const errorMessages = Object.values(result.validationErrors).join('\n');
                   toast.error(errorMessages);
                   return; // Dừng lại không đóng modal
                }
                throw new Error(result.message || "Thao tác thất bại.");
            }
            
            toast.success(result.message || "Thao tác thành công!");
            setIsModalOpen(false);
            fetchMyFaculties(); // Tải lại danh sách
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
        }
    };

    const handleDeleteFaculty = async () => {
        if (!facultyToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/my-faculties/${facultyToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                 throw new Error(result.message || "Xóa khoa thất bại.");
            }
            
            toast.success(result.message || "Xóa khoa thành công!");
            setIsDeleteModalOpen(false);
            fetchMyFaculties(); // Tải lại danh sách
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
                                <h2 className="text-xl font-semibold text-black dark:text-white">Danh sách Khoa của trường</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Thêm Khoa</span>
                                </button>
                            </div>
                            
                            {isLoading ? <p>Đang tải danh sách khoa...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {facultyPage && facultyPage.content.length > 0 ? (
                                        facultyPage.content.map(faculty => (
                                            <FacultyCard 
                                                key={faculty.id} 
                                                faculty={faculty} 
                                                onEdit={handleOpenEditModal} 
                                                onDelete={handleOpenDeleteModal}
                                            />
                                        ))
                                    ) : (
                                       <p className="col-span-full text-center text-gray-500 py-10">Bạn chưa có khoa nào. Hãy thêm khoa mới.</p>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <FacultyModal
                    isOpen={isModalOpen}
                    mode={modalMode}
                    facultyData={currentFaculty}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFormSubmit}
                />
            )}

            {isDeleteModalOpen && facultyToDelete && (
                 <DeleteConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteFaculty}
                    facultyName={facultyToDelete.name}
                />
            )}
        </>
    );
};

// --- CẢI TIẾN: Tách các component con ra cho dễ quản lý ---

// Component Card hiển thị thông tin Khoa
const FacultyCard = ({ faculty, onEdit, onDelete }: { faculty: Faculty, onEdit: (f: Faculty) => void, onDelete: (f: Faculty) => void }) => (
    // THAY ĐỔI 1: Thêm hiệu ứng đổ bóng và "nâng" card lên khi hover
    <div className="border rounded-lg p-4 flex flex-col items-center text-center dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        
        {/* THAY ĐỔI 2: Chuyển ảnh từ tròn sang khung chữ nhật bo góc */}
        <div className="relative w-full h-32 mb-4">
             <Image 
                src={faculty.imageUrl || placeholderImage} 
                alt={faculty.name} 
                layout="fill" 
                objectFit="cover" // Dùng 'cover' để ảnh lấp đầy khung
                className="rounded-md" // Chuyển từ 'rounded-full' thành 'rounded-md'
                unoptimized
            />
        </div>

        <h3 className="font-semibold text-lg dark:text-white flex-grow">{faculty.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10 overflow-hidden">{faculty.description}</p>
        <div className="mt-4 flex space-x-4">
            <button onClick={() => onEdit(faculty)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
            <button onClick={() => onDelete(faculty)} className="text-sm text-red-600 hover:text-red-800 font-medium">Xóa</button>
        </div>
    </div>
);

// Component Modal cho việc Tạo/Sửa Khoa
const FacultyModal = ({ isOpen, mode, facultyData, onClose, onSubmit }) => {
    const [currentFaculty, setCurrentFaculty] = useState(facultyData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(facultyData.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        const dataToSubmit = { name: currentFaculty.name, description: currentFaculty.description };
        const dataBlob = new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' });
        formData.append('facultyData', dataBlob);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{mode === 'create' ? 'Tạo Khoa mới' : 'Chỉnh sửa Khoa'}</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Tên khoa</label>
                        <input id="name" type="text" value={currentFaculty.name || ''} onChange={(e) => setCurrentFaculty({...currentFaculty, name: e.target.value})} required className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 outline-none dark:border-form-strokedark dark:bg-form-input" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea id="description" value={currentFaculty.description || ''} onChange={(e) => setCurrentFaculty({...currentFaculty, description: e.target.value})} rows={3} className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 outline-none dark:border-form-strokedark dark:bg-form-input" />
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium mb-2">Ảnh đại diện</label>
                        <Image src={imagePreview || placeholderImage} alt="Preview" width={100} height={100} className="w-24 h-24 rounded-full object-cover mb-3" unoptimized />
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


// Component Modal xác nhận Xóa
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, facultyName }) => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa vĩnh viễn khoa <span className="font-semibold">"{facultyName}"</span>?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
            </div>
        </div>
    </div>
);


export default FacultiesManagementPage;