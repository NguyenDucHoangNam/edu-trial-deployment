// app/my-university/student-life/page.tsx

"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Định nghĩa Interface & Dữ liệu Menu ---
interface StudentLifeImage {
    id: number;
    name: string;
    imageUrl: string;
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
const StudentLifePage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    const [images, setImages] = useState<StudentLifeImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentImage, setCurrentImage] = useState<Partial<StudentLifeImage>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<StudentLifeImage | null>(null);

    const fetchImages = useCallback(async (page: number, loadMore = false) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/university-student-life-images/my-images?page=${page}&size=9`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Không thể tải danh sách ảnh.");
            
            const result = await response.json();
            const imageList = result.data?.content;
            
            if (result.success && Array.isArray(imageList)) {
                setImages(prev => loadMore ? [...prev, ...imageList] : imageList);
                setHasMore(!result.data.last);
                setCurrentPage(result.data.number);
            } else {
                setImages(prev => loadMore ? prev : []);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchImages(0);
    }, [fetchImages]);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentImage({ name: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (image: StudentLifeImage) => {
        setModalMode('edit');
        setCurrentImage(image);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (image: StudentLifeImage) => {
        setImageToDelete(image);
        setIsDeleteModalOpen(true);
    };
    
    const handleFormSubmit = async (formData: FormData) => {
        if (!token) return;
        const isCreating = modalMode === 'create';
        const url = isCreating ? "/api/v1/university-student-life-images" : `/api/v1/university-student-life-images/${currentImage.id}`;
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
            fetchImages(0); // Tải lại từ trang đầu
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
        }
    };

    const handleDeleteImage = async () => {
        if (!imageToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/university-student-life-images/${imageToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const result = await response.json().catch(() => ({message: "Xóa ảnh thất bại."}));
                 throw new Error(result.message);
            }
            toast.success("Xóa ảnh thành công!");
            setIsDeleteModalOpen(false);
            fetchImages(0); // Tải lại từ trang đầu
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
                                <h2 className="text-xl font-semibold text-black dark:text-white">Thư viện ảnh Đời sống sinh viên</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Tải ảnh mới</span>
                                </button>
                            </div>

                            {isLoading && images.length === 0 ? <p>Đang tải...</p> : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {images.map((image) => (
                                           <ImageCard key={image.id} image={image} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                                        ))}
                                    </div>
                                    {images.length === 0 && !isLoading && (
                                        <div className="col-span-full py-10 text-center text-gray-500">Chưa có ảnh nào. Hãy tải lên ảnh đầu tiên.</div>
                                    )}
                                    {hasMore && (
                                        <div className="mt-8 text-center">
                                            <button onClick={() => fetchImages(currentPage + 1, true)} disabled={isLoading} className="rounded-md bg-gray-200 dark:bg-gray-700 px-6 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                                                {isLoading ? 'Đang tải...' : 'Tải thêm'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <ImageModal isOpen={isModalOpen} mode={modalMode} imageData={currentImage} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} />
            )}
             {isDeleteModalOpen && imageToDelete && (
                <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteImage} imageName={imageToDelete.name} />
            )}
        </>
    );
};

// --- Các Component con ---
const ImageCard = ({ image, onEdit, onDelete }) => (
    <div className="group relative border rounded-lg dark:border-gray-700 shadow-md overflow-hidden">
        <Image src={image.imageUrl || placeholderImage} alt={image.name} width={400} height={400} className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105" unoptimized/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
            <p className="text-white font-semibold truncate">{image.name}</p>
            <div className="flex space-x-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => onEdit(image)} className="text-xs text-white bg-blue-600/80 hover:bg-blue-600 rounded-full px-3 py-1">Sửa</button>
                <button onClick={() => onDelete(image)} className="text-xs text-white bg-red-600/80 hover:bg-red-600 rounded-full px-3 py-1">Xóa</button>
            </div>
        </div>
    </div>
);

const ImageModal = ({ isOpen, mode, imageData, onClose, onSubmit }) => {
    const [currentImage, setCurrentImage] = useState(imageData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(imageData.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (mode === 'create' && !imageFile) {
            toast.error("Vui lòng chọn một ảnh để tải lên.");
            return;
        }
        setIsSubmitting(true);
        const dataToSubmit = { name: currentImage.name };
        const dataBlob = new Blob([JSON.stringify(dataToSubmit)], { type: 'application/json' });
        
        const formData = new FormData();
        formData.append('imageData', dataBlob);
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{mode === 'create' ? 'Tải ảnh mới' : 'Chỉnh sửa thông tin ảnh'}</h3>
                <div className="space-y-4">
                     <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium mb-2 w-full">Xem trước</label>
                        <div className="w-full aspect-video relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                             <Image src={imagePreview || placeholderImage} alt="Preview" layout="fill" objectFit="contain" unoptimized/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="imageFile" className="block text-sm font-medium mb-1">Tệp ảnh</label>
                        <input id="imageFile" type="file" accept="image/*" required={mode === 'create'} onChange={e => {
                            if(e.target.files?.[0]) {
                                const file = e.target.files[0];
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                            }
                        }} className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Tên hoặc mô tả ảnh</label>
                        <input id="name" type="text" value={currentImage.name || ''} onChange={(e) => setCurrentImage({...currentImage, name: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
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

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, imageName }) => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa ảnh <span className="font-semibold">"{imageName}"</span>?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
            </div>
        </div>
    </div>
);

export default StudentLifePage;