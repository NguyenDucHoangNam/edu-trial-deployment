// app/my-university/events/page.tsx

"use client";

import { useState, useEffect, FormEvent, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from "next/image";

// --- Định nghĩa Interface & Dữ liệu Menu ---
interface UniversityEvent {
    id: number;
    title: string;
    description: string;
    date: string; // API format: "YYYY-MM-DD HH:mm:ss"
    location: string;
    link: string | null;
    imageUrl: string | null;
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
const EventsManagementPage = () => {
    const pathname = usePathname();
    const { token } = useAuth();
    const [events, setEvents] = useState<UniversityEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentEvent, setCurrentEvent] = useState<Partial<UniversityEvent>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<UniversityEvent | null>(null);

    const fetchEvents = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch("/api/v1/university-events/my-events", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Không thể tải danh sách sự kiện.");
            const result = await response.json();
            
            const eventList = result.data?.content || result.data || [];
            if (Array.isArray(eventList)) {
                setEvents(eventList);
            } else {
                setEvents([]);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Lỗi không xác định.");
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setCurrentEvent({ title: '', description: '', date: '', location: '', link: '' });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (event: UniversityEvent) => {
        setModalMode('edit');
        setCurrentEvent(event);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (event: UniversityEvent) => {
        setEventToDelete(event);
        setIsDeleteModalOpen(true);
    };
    
    const handleFormSubmit = async (formData: FormData) => {
        if (!token) return;
        const isCreating = modalMode === 'create';
        const url = isCreating ? "/api/v1/university-events" : `/api/v1/university-events/${currentEvent.id}`;
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
            fetchEvents();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Thao tác thất bại.");
        }
    };

    const handleDeleteEvent = async () => {
        if (!eventToDelete || !token) return;
        try {
            const response = await fetch(`/api/v1/university-events/${eventToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const result = await response.json().catch(() => ({message: "Xóa thất bại."}));
                 throw new Error(result.message);
            }
            toast.success("Xóa sự kiện thành công!");
            setIsDeleteModalOpen(false);
            fetchEvents();
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
                                <h2 className="text-xl font-semibold text-black dark:text-white">Danh sách sự kiện</h2>
                                <button onClick={handleOpenCreateModal} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    <span>Thêm sự kiện</span>
                                </button>
                            </div>

                            {isLoading ? <p>Đang tải...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {events.length > 0 ? events.map((event) => (
                                       <EventCard key={event.id} event={event} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />
                                    )) : (
                                        <div className="col-span-full py-10 text-center text-gray-500">Chưa có sự kiện nào.</div>
                                    )}
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>

            {isModalOpen && (
                <EventModal isOpen={isModalOpen} mode={modalMode} eventData={currentEvent} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} />
            )}
            {isDeleteModalOpen && eventToDelete && (
                <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteEvent} eventName={eventToDelete.title} />
            )}
        </>
    );
};

// --- Các Component con ---
const EventCard = ({ event, onEdit, onDelete }) => {
    const eventDate = new Date(event.date.replace(" ", "T"));
    const formattedDate = eventDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="border rounded-lg flex flex-col dark:border-gray-700 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Image src={event.imageUrl || placeholderImage} alt={event.title} width={400} height={200} className="w-full h-40 object-cover rounded-t-lg" unoptimized/>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-primary mb-2">{event.title}</h3>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formattedDate} - {formattedTime}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{event.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{event.description}</p>
                 <div className="mt-4 pt-4 border-t dark:border-gray-600 flex justify-end space-x-4">
                    <button onClick={() => onEdit(event)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
                    <button onClick={() => onDelete(event)} className="text-sm text-red-600 hover:text-red-800 font-medium">Xóa</button>
                </div>
            </div>
        </div>
    );
}

// app/my-university/events/page.tsx

// ... (các phần code khác giữ nguyên)


// Component Modal cho việc Tạo/Sửa Sự kiện (ĐÃ CẬP NHẬT)
const EventModal = ({ isOpen, mode, eventData, onClose, onSubmit }) => {
    const [currentEvent, setCurrentEvent] = useState(eventData);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(eventData.imageUrl);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chuyển đổi định dạng ngày tháng để hiển thị và gửi đi
    // Hàm này được làm an toàn hơn để xử lý giá trị rỗng
    const formatToInput = (apiDate: string | undefined): string => {
        if (!apiDate) return "";
        // API format: "YYYY-MM-DD HH:mm:ss" -> Input format: "YYYY-MM-DDTHH:mm"
        return apiDate.substring(0, 16).replace(" ", "T");
    };

    const formatToApi = (inputDate: string | undefined): string => {
        if (!inputDate) return "";
        // Input format: "YYYY-MM-DDTHH:mm" -> API format: "YYYY-MM-DD HH:mm:ss"
        return inputDate.replace("T", " ") + ":00";
    };
    
    // Sử dụng useMemo để chỉ tính toán lại giá trị khi currentEvent.date thay đổi
    const displayDate = useMemo(() => formatToInput(currentEvent.date), [currentEvent.date]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // --- LOGIC TẠO FORMDATA ĐÃ ĐƯỢC KIỂM TRA LẠI ---
        const dataForJson = {
            title: currentEvent.title,
            date: formatToApi(currentEvent.date), // Luôn chuyển đổi về định dạng API
            description: currentEvent.description,
            location: currentEvent.location,
            link: currentEvent.link,
        };
        
        // Dùng để kiểm tra xem JSON gửi đi có đúng không
        console.log("Dữ liệu JSON đang được gửi:", JSON.stringify(dataForJson));

        const formData = new FormData();
        const eventBlob = new Blob([JSON.stringify(dataForJson)], { type: 'application/json' });
        
        formData.append('eventData', eventBlob);
        
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }
        
        await onSubmit(formData); // Gọi hàm submit từ component cha
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">{mode === 'create' ? 'Tạo sự kiện mới' : 'Chỉnh sửa sự kiện'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium mb-1">Tiêu đề sự kiện</label>
                        <input id="title" type="text" value={currentEvent.title || ''} onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-1">Thời gian</label>
                        <input id="date" type="datetime-local" value={displayDate} onChange={(e) => setCurrentEvent({...currentEvent, date: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium mb-1">Địa điểm</label>
                        <input id="location" type="text" value={currentEvent.location || ''} onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})} required className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                     <div className="md:col-span-2">
                        <label htmlFor="link" className="block text-sm font-medium mb-1">Link sự kiện (nếu có)</label>
                        <input id="link" type="url" value={currentEvent.link || ''} onChange={(e) => setCurrentEvent({...currentEvent, link: e.target.value})} className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea id="description" value={currentEvent.description || ''} onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})} rows={4} className="w-full rounded-md border-stroke bg-transparent px-3 py-2"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Ảnh sự kiện</label>
                        <Image src={imagePreview || placeholderImage} alt="Preview" width={400} height={200} className="w-full h-40 object-cover rounded-md mb-3" unoptimized/>
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
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-md bg-primary text-white hover:bg-opacity-90">{isSubmitting ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
            </form>
        </div>
    );
};

// ... các component khác giữ nguyên

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, eventName }) => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa sự kiện <span className="font-semibold">"{eventName}"</span>?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
            </div>
        </div>
    </div>
);


export default EventsManagementPage;