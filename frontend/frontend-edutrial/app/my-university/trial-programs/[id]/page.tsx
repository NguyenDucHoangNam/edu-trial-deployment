// app/my-university/trial-programs/[id]/page.tsx

"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BookOpen, ChevronDown, ChevronUp, Clapperboard, Edit, PlusCircle, Trash2, BookMarked, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// --- Interfaces ---
interface Lesson {
    id: number;
    title: string;
    content: string;
    videoUrl: string | null;
    orderIndex: number;
}

interface Chapter {
    id: number;
    name: string;
    description: string;
    orderIndex: number;
    lessons: Lesson[];
}

interface TrialProgram {
    id: number;
    name: string;
}

// --- Component Chính ---
const TrialProgramContentPage = () => {
    const params = useParams();
    const { token } = useAuth();
    const programId = params.id as string;

    const [program, setProgram] = useState<TrialProgram | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    
    // State quản lý Modal
    const [modalState, setModalState] = useState<{
        type: 'chapter' | 'lesson' | null;
        mode: 'create' | 'edit';
        data?: Partial<Chapter> | Partial<Lesson>;
        parentId?: number; // chapterId khi tạo/sửa lesson
    }>({ type: null, mode: 'create' });
    
    const [deleteTarget, setDeleteTarget] = useState<{type: 'chapter' | 'lesson', data: Chapter | Lesson} | null>(null);

    // --- Logic Fetch Dữ Liệu ---
    const fetchData = useCallback(async () => {
        if (!token || !programId) return;
        setIsLoading(true);
        try {
            // Lấy thông tin chung của chương trình
            const programRes = await fetch(`/api/v1/trial-programs/public/${programId}`);
            if(programRes.ok) {
                const programResult = await programRes.json();
                if(programResult.success) setProgram(programResult.data);
            } else {
                 setProgram({ id: Number(programId), name: "Chương trình học thử" });
            }

            // Lấy danh sách các chương
            const chaptersRes = await fetch(`/api/v1/chapters/public/by-program/${programId}`);
            if (!chaptersRes.ok) throw new Error("Không thể tải danh sách chương.");
            
            const chaptersResult = await chaptersRes.json();
            const chapterList = chaptersResult.data?.content || chaptersResult.data || [];
            
            if (chaptersResult.success && Array.isArray(chapterList)) {
                const chaptersWithLessons = await Promise.all(
                    chapterList.map(async (chapter: Chapter) => {
                        const lessonsRes = await fetch(`/api/v1/lessons/public/by-chapter/${chapter.id}`);
                        const lessonsResult = await lessonsRes.json();
                        const lessonList = lessonsResult.data?.content || lessonsResult.data || [];
                        return { ...chapter, lessons: Array.isArray(lessonList) ? lessonList.sort((a,b) => a.orderIndex - b.orderIndex) : [] };
                    })
                );

                const sortedChapters = chaptersWithLessons.sort((a, b) => a.orderIndex - b.orderIndex);
                setChapters(sortedChapters);

                if (sortedChapters.length > 0 && Object.keys(expandedChapters).length === 0) {
                     setExpandedChapters({ [sortedChapters[0].id]: true });
                }
            }
        } catch (error) {
            toast.error("Lỗi tải dữ liệu: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [token, programId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Handlers cho các hành động CRUD ---
    const handleChapterSubmit = async (data: Omit<Chapter, 'id' | 'lessons'>) => {
        if (!token) return;
        const { mode, data: currentData } = modalState;
        const isCreating = mode === 'create';
        const url = isCreating ? `/api/v1/chapters/for-program/${programId}` : `/api/v1/chapters/${currentData!.id}`;
        const method = isCreating ? 'POST' : 'PUT';
        
        try {
            const response = await fetch(url, { method, headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'}, body: JSON.stringify(data) });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message);
            toast.success(result.message);
            setModalState({ type: null, mode: 'create' });
            fetchData();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };
    
    const handleLessonSubmit = async (data: FormData) => {
        if (!token || !modalState.parentId) return;
        const { mode, data: currentData } = modalState;
        const isCreating = mode === 'create';
        const url = isCreating ? `/api/v1/lessons/for-chapter/${modalState.parentId}` : `/api/v1/lessons/${currentData!.id}`;
        const method = isCreating ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, { method, headers: {'Authorization': `Bearer ${token}`}, body: data });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Thao tác thất bại.");
            toast.success(result.message);
            setModalState({ type: null, mode: 'create' });
            fetchData();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || !token) return;
        const { type, data } = deleteTarget;
        const url = `/api/v1/${type === 'chapter' ? 'chapters' : 'lessons'}/${data.id}`;
        
        try {
            const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
            if (!response.ok) {
                 const result = await response.json().catch(() => null);
                 throw new Error(result?.message || `Xóa ${type === 'chapter' ? 'chương' : 'bài học'} thất bại.`);
            }
            toast.success(`Xóa ${type === 'chapter' ? 'chương' : 'bài học'} thành công!`);
            setDeleteTarget(null);
            fetchData();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };
    
    if (isLoading) return <div className="text-center py-40">Đang tải...</div>;
    if (!program) return <div className="text-center py-40">Không tìm thấy chương trình.</div>;

    return (
        <section className="py-28 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer />
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <Link href="/my-university/trial-programs" className="inline-flex items-center text-primary hover:underline">
                        <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
                    </Link>
                </div>
                <div className="flex justify-between items-center mb-10 border-b pb-4 dark:border-gray-700">
                     <h1 className="text-3xl font-bold dark:text-white">Nội dung: {program.name}</h1>
                     <button onClick={() => setModalState({ type: 'chapter', mode: 'create', data: { orderIndex: chapters.length + 1 } })} className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-opacity-90 transition-colors">
                        <PlusCircle size={18}/> Thêm chương
                    </button>
                </div>
               
                <div className="space-y-4">
                    {chapters.map(chapter => (
                        <div key={chapter.id} className="border rounded-lg dark:border-gray-700">
                           <div onClick={() => setExpandedChapters(p => ({...p, [chapter.id]: !p[chapter.id]}))} className="p-4 flex justify-between items-center cursor-pointer bg-white dark:bg-dark rounded-t-lg">
                               <div className="flex items-center gap-3">
                                   <BookOpen className="text-primary"/>
                                   <h2 className="text-xl font-semibold dark:text-white">{chapter.orderIndex}. {chapter.name}</h2>
                               </div>
                               <div className="flex items-center gap-4">
                                   <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'lesson', mode: 'create', parentId: chapter.id, data: { orderIndex: chapter.lessons?.length ? chapter.lessons.length + 1 : 1 } })}} className="text-green-500 hover:text-green-700" title="Thêm bài học"><PlusCircle size={20}/></button>
                                   <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'chapter', mode: 'edit', data: chapter }) }} className="text-blue-500 hover:text-blue-700" title="Sửa chương"><Edit size={20}/></button>
                                   <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'chapter', data: chapter }) }} className="text-red-500 hover:text-red-700" title="Xóa chương"><Trash2 size={20}/></button>
                                   {expandedChapters[chapter.id] ? <ChevronUp/> : <ChevronDown/>}
                               </div>
                           </div>
                           {expandedChapters[chapter.id] && (
                               <div className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                                   {chapter.lessons.map(lesson => (
                                       <div key={lesson.id} className="p-3 border-l-4 border-primary bg-white dark:bg-dark rounded-r-md flex justify-between items-center">
                                           <div className="flex items-center gap-3">
                                               <Clapperboard size={18} className="text-gray-600 dark:text-gray-300"/>
                                               <p>{lesson.orderIndex}. {lesson.title}</p>
                                           </div>
                                           <div className="flex items-center gap-3">
                                               <button onClick={() => setModalState({ type: 'lesson', mode: 'edit', parentId: chapter.id, data: lesson })} className="text-blue-500 hover:text-blue-700" title="Sửa bài học"><Edit size={18}/></button>
                                               <button onClick={() => setDeleteTarget({ type: 'lesson', data: lesson })} className="text-red-500 hover:text-red-700" title="Xóa bài học"><Trash2 size={18}/></button>
                                           </div>
                                       </div>
                                   ))}
                                   {chapter.lessons.length === 0 && <p className="text-sm text-gray-500 italic px-3">Chưa có bài học nào.</p>}
                               </div>
                           )}
                        </div>
                    ))}
                    {chapters.length === 0 && !isLoading && <p className="text-center text-gray-500 py-10">Chương trình này chưa có nội dung. Hãy bắt đầu bằng cách thêm chương đầu tiên.</p>}
                </div>
            </div>

            {modalState.type === 'chapter' && <ChapterModal mode={modalState.mode} data={modalState.data || {}} onSubmit={handleChapterSubmit} onClose={() => setModalState({type: null, mode: 'create'})} />}
            {modalState.type === 'lesson' && <LessonModal mode={modalState.mode} data={modalState.data || {}} chapterName={chapters.find(c => c.id === modalState.parentId)?.name || ''} onSubmit={handleLessonSubmit} onClose={() => setModalState({type: null, mode: 'create'})} />}
            
            {deleteTarget && <DeleteConfirmModal 
                type={deleteTarget.type} 
                itemName={deleteTarget.type === 'chapter' ? (deleteTarget.data as Chapter).name : (deleteTarget.data as Lesson).title}
                onConfirm={handleDelete} 
                onClose={() => setDeleteTarget(null)} 
            />}
        </section>
    );
};

// --- Modal Components ---

const ChapterModal = ({ mode, data, onSubmit, onClose }: {mode: 'create' | 'edit', data: Partial<Chapter>, onSubmit: (data: Omit<Chapter, 'id' | 'lessons'>) => void, onClose: () => void}) => {
    const [name, setName] = useState(data.name || '');
    const [description, setDescription] = useState(data.description || '');
    const [orderIndex, setOrderIndex] = useState(data.orderIndex || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({ name, description, orderIndex });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{mode === 'create' ? 'Tạo Chương mới' : 'Sửa Chương'}</h2>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium mb-1">Tên chương</label>
                         <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-600"/>
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">Mô tả</label>
                         <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-600"/>
                     </div>
                      <div>
                         <label className="block text-sm font-medium mb-1">Thứ tự</label>
                         <input type="number" value={orderIndex} onChange={e => setOrderIndex(Number(e.target.value))} required min="1" className="w-full mt-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-600"/>
                     </div>
                 </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded">Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-primary text-white disabled:bg-gray-400">{isSubmitting ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
             </form>
        </div>
    );
};

const LessonModal = ({ mode, data, chapterName, onSubmit, onClose }: {mode: 'create' | 'edit', data: Partial<Lesson>, chapterName: string, onSubmit: (data: FormData) => void, onClose: () => void}) => {
    const [formData, setFormData] = useState({
        title: data.title || '',
        content: data.content || '',
        orderIndex: data.orderIndex || 1,
        videoUrl: data.videoUrl || '',
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('content', formData.content);
        dataToSend.append('orderIndex', String(formData.orderIndex));
        if (formData.videoUrl) dataToSend.append('videoUrl', formData.videoUrl);
        if (videoFile) dataToSend.append('videoFile', videoFile);
        
        await onSubmit(dataToSend);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
             <form onSubmit={handleSubmit} className="bg-white dark:bg-dark p-6 rounded-lg w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-1">{mode === 'create' ? 'Tạo Bài học mới' : 'Sửa Bài học'}</h2>
                <p className="text-sm text-gray-500 mb-4">Trong chương: {chapterName}</p>
                 <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                     <InputField name="title" label="Tiêu đề bài học" value={formData.title} onChange={handleChange} required />
                     <TextAreaField name="content" label="Nội dung bài học" value={formData.content} onChange={handleChange} rows={10} />
                     <div className="grid grid-cols-2 gap-4">
                        <InputField name="orderIndex" label="Thứ tự" type="number" value={formData.orderIndex} onChange={handleChange} required min="1" />
                        <InputField name="videoUrl" label="Hoặc dán link video" value={formData.videoUrl} onChange={handleChange} placeholder="YouTube, Vimeo..."/>
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">Tải lên video (ưu tiên hơn link)</label>
                         <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                     </div>
                 </div>
                <div className="flex justify-end gap-3 mt-6 border-t pt-4 dark:border-gray-700">
                    <button type="button" onClick={onClose}>Hủy</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-primary text-white disabled:bg-gray-400">{isSubmitting ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
             </form>
        </div>
    )
};

const DeleteConfirmModal = ({ type, itemName, onConfirm, onClose }: { type: 'chapter' | 'lesson', itemName: string, onConfirm: () => void, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-dark p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Xác nhận Xóa</h3>
            <p>Bạn có chắc chắn muốn xóa vĩnh viễn {type === 'chapter' ? 'chương' : 'bài học'} <span className="font-semibold">"{itemName}"</span>?</p>
            <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600">Không</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Có, xóa</button>
            </div>
        </div>
    </div>
);

// Tái sử dụng các component input
const InputField = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium mb-1">{label}</label>
        <input {...props} className="w-full mt-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-600" />
    </div>
);
const TextAreaField = ({ label, ...props }: { label: string, [key: string]: any }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium mb-1">{label}</label>
        <textarea {...props} className="w-full mt-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-600" />
    </div>
);

export default TrialProgramContentPage;
