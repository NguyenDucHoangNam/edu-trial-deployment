// app/hoc-thu/chi-tiet/[id]/page.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, ChevronDown, ChevronUp, Clapperboard, Video, ArrowLeft, ArrowRight, CheckCircle, FileText, Send, PlayCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    description: string;
    coverImageUrl: string | null;
    universityName: string;
    universityLogoUrl?: string;
}

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2VlZSI+PHBhdGggZD0iTTIxIDNINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yem0wIDE2SDVWNWgxNHYxNHptLTUuNS02LjVjMC0xLjM4LTEuMTItMi41LTIuNS0yLjVzLTIuNSAxLjEyLTIuNSAyLjUgMS4xMiAyLjUgMi41IDIuNSAyLjUtMS4xMiAyLjUtMi41ek0xNyAxNC41bC0xLjI1LTEuNTgtMi4xNyAyLjU3TDExLjUgMTNsLTIuMjUgMy4wMUg3di0yaDEwbC0xLjYyLTIuMTR6Ii8+PC9zdmc+";

// --- Form tư vấn ---
const ConsultationForm = ({ programName, onSubmit, isSubmitting }) => (
    <form onSubmit={onSubmit} className="space-y-4">
        <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và Tên</label>
            <input type="text" name="fullName" id="fullName" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-600"/>
        </div>
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" name="email" id="email" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-600"/>
        </div>
        <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
            <input type="tel" name="phone" id="phone" required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-600"/>
        </div>
        <div>
            <label htmlFor="aspiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Em muốn được tư vấn thêm về...</label>
            <textarea name="aspiration" id="aspiration" rows={4} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-600" placeholder={`VD: Cơ hội việc làm của ngành ${programName}`}></textarea>
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400">
            <Send size={18} className="mr-2"/> {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
        </button>
    </form>
);


// --- Component Chính ---
const TrialProgramDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const programId = params.id as string;

    const [program, setProgram] = useState<TrialProgram | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [hasStartedCourse, setHasStartedCourse] = useState(false);
    
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fetchData = useCallback(async () => {
        if (!programId) return;
        setIsLoading(true);
        try {
            const programRes = await fetch(`/api/v1/trial-programs/public/${programId}`);
            if (!programRes.ok) throw new Error("Không tìm thấy chương trình học thử.");
            const programResult = await programRes.json();
            if (programResult.success) setProgram(programResult.data);
            
            const chaptersRes = await fetch(`/api/v1/chapters/public/by-program/${programId}`);
            if (!chaptersRes.ok) throw new Error("Không thể tải danh sách chương.");
            
            const chaptersResult = await chaptersRes.json();
            const chapterList = chaptersResult.data?.content || chaptersResult.data || [];

            if (Array.isArray(chapterList)) {
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
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn.");
        } finally {
            setIsLoading(false);
        }
    }, [programId]);

    useEffect(() => {
        fetchData();
        
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                setIsExitModalOpen(true);
                document.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [fetchData]);

    const handleConsultationSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            aspiration: formData.get('aspiration'),
            trialProgramId: Number(programId)
        };

        try {
            const response = await fetch("/api/v1/consultations/request", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Gửi yêu cầu thất bại.");
            
            toast.success("Yêu cầu tư vấn của bạn đã được gửi thành công! Đội ngũ tuyển sinh sẽ sớm liên hệ cho bạn.");
            form.reset();
            setIsExitModalOpen(false);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getYouTubeEmbedUrl = (url: string | undefined | null): string => {
        if (!url) return '';
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };
    
    const allLessons = useMemo(() => chapters.flatMap(ch => ch.lessons), [chapters]);
    const currentLessonIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
    
    const goToLesson = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev' ? currentLessonIndex - 1 : currentLessonIndex + 1;
        if (newIndex >= 0 && newIndex < allLessons.length) {
            setActiveLesson(allLessons[newIndex]);
        }
    };

    // =======================================================
    // ========= SỬA LỖI Ở ĐÂY =========
    // Di chuyển useMemo ra cấp cao nhất của component
    const totalLessons = useMemo(() => {
        return chapters.reduce((acc, chap) => acc + chap.lessons.length, 0);
    }, [chapters]);
    // =======================================================


    if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Đang tải...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900 text-red-500">{error}</div>;
    if (!program) return <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">Không có dữ liệu.</div>;

    return (
        <section className="pt-24 bg-gray-100 dark:bg-gray-900">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="flex flex-col lg:flex-row">
                <aside className="w-full lg:w-[320px] xl:w-[360px] bg-white dark:bg-dark border-r dark:border-gray-700 lg:min-h-[calc(100vh-6rem)] lg:sticky lg:top-24 flex-shrink-0">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        {program.universityLogoUrl && <Image src={program.universityLogoUrl} alt={program.universityName} width={120} height={30} className="h-8 mb-2 w-auto"unoptimized/>}
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{program.name}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">bởi {program.universityName}</p>
                    </div>
                    <nav className="py-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 13rem)'}}>
                        {chapters.map((chapter) => (
                            <div key={chapter.id} className="px-2 mb-1">
                                <button onClick={() => setExpandedChapters(p => ({...p, [chapter.id]: !p[chapter.id]}))} className="w-full flex justify-between items-center px-3 py-2.5 text-sm font-semibold text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                    <span>{chapter.orderIndex}. {chapter.name}</span>
                                    {expandedChapters[chapter.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {expandedChapters[chapter.id] && (
                                    <ul className="pl-4 mt-1 border-l-2 border-blue-500/20 ml-2">
                                        {chapter.lessons.map((lesson) => (
                                            <li key={lesson.id}>
                                                <button onClick={() => setActiveLesson(lesson)} className={`w-full text-left px-3 py-2 my-0.5 text-sm rounded-md flex items-center transition-colors ${activeLesson?.id === lesson.id ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                                    {lesson.videoUrl ? <Clapperboard size={14} className="mr-2 flex-shrink-0" /> : <FileText size={14} className="mr-2 flex-shrink-0" />}
                                                    <span className="flex-grow truncate">{lesson.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </nav>
                </aside>

                <main className="w-full flex-1 p-6 md:p-8 bg-gray-50 dark:bg-gray-900/50">
                    {!hasStartedCourse ? (
                        <div className="max-w-5xl mx-auto">
                            <div className="bg-white dark:bg-dark shadow-2xl rounded-2xl overflow-hidden">
                                <div className="p-6 md:p-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Image src={program.universityLogoUrl || placeholderImage} alt={program.universityName} width={40} height={40} className="h-10 w-10 object-contain rounded-full" unoptimized/>
                                        <span className="font-semibold text-gray-600 dark:text-gray-300">{program.universityName}</span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">{program.name}</h1>
                                    <div className="my-8 shadow-xl rounded-2xl overflow-hidden">
                                        <Image src={program.coverImageUrl || placeholderImage} alt={program.name} width={1200} height={675} className="w-full aspect-video object-cover"unoptimized/>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">Về khóa học này</h2>
                                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">{program.description}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center my-8 p-4 bg-sky-50 dark:bg-sky-900/30 rounded-xl">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Số chương</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{chapters.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số bài học</p>
                                            {/* Sử dụng biến đã được memoize */}
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalLessons}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Hình thức</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Video & Text</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Yêu cầu</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Không</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 pb-8 text-center">
                                    <button
                                        onClick={() => {
                                            setHasStartedCourse(true);
                                            if (chapters.length > 0 && chapters[0].lessons.length > 0) {
                                                setActiveLesson(chapters[0].lessons[0]);
                                                setExpandedChapters({ [chapters[0].id]: true });
                                            }
                                        }}
                                        className="w-full md:w-auto inline-flex items-center justify-center px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        <PlayCircle size={24} className="mr-3"/>
                                        Bắt đầu học ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        activeLesson ? (
                            <div className="max-w-4xl mx-auto">
                                <div className="aspect-video bg-black rounded-lg shadow-2xl overflow-hidden mb-6">
                                    {activeLesson.videoUrl ? (
                                        <iframe src={getYouTubeEmbedUrl(activeLesson.videoUrl)} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-800">
                                            <BookOpen size={64} />
                                            <p className="ml-4 mt-4 text-lg">Nội dung bài học dạng văn bản</p>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">{activeLesson.title}</h1>
                                <div className="prose prose-sm sm:prose-base max-w-none bg-white dark:bg-dark p-6 rounded-lg shadow-md mb-6" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                                <div className="flex justify-between items-center mt-8 border-t dark:border-gray-700 pt-6">
                                    <button onClick={() => goToLesson('prev')} disabled={currentLessonIndex <= 0} className="flex items-center px-4 py-2 bg-white hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border dark:border-gray-600 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        <ArrowLeft size={16} className="mr-2" /> Bài trước
                                    </button>
                                    <button onClick={() => goToLesson('next')} disabled={currentLessonIndex >= allLessons.length - 1} className="flex items-center px-4 py-2 bg-white hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 border dark:border-gray-600 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        Bài sau <ArrowRight size={16} className="ml-2" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 dark:text-white">
                                <h2 className="text-2xl font-bold">Không có bài học nào trong khóa này.</h2>
                                <p className="mt-4">Vui lòng kiểm tra lại hoặc liên hệ với chúng tôi.</p>
                            </div>
                        )
                    )}

                    <section id="tu-van" className="max-w-4xl mx-auto mt-16 pt-10 border-t-2 border-dashed dark:border-gray-700">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Cần thêm thông tin?</h2>
                            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Để lại thông tin để được đội ngũ tư vấn của {program.universityName} liên hệ nhé!</p>
                        </div>
                        <div className="mt-8 max-w-xl mx-auto bg-white dark:bg-dark p-8 rounded-2xl shadow-2xl">
                            <ConsultationForm programName={program.name} onSubmit={handleConsultationSubmit} isSubmitting={isSubmitting} />
                        </div>
                    </section>
                </main>
            </div>

            {isExitModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-dark rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
                        <button onClick={() => setIsExitModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">×</button>
                        <h3 className="text-2xl font-bold text-center mb-2 dark:text-white">Khoan đã!</h3>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Bạn có muốn được tư vấn miễn phí về khóa học này không?</p>
                        <ConsultationForm programName={program.name} onSubmit={handleConsultationSubmit} isSubmitting={isSubmitting} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default TrialProgramDetailPage;