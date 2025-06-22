
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';

// --- Định nghĩa các Interface dựa trên API Response ---

// SỬA ĐỔI: Thêm description và imageUrl vào Major
interface Major {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
}

interface Faculty {
    id: number;
    name: string;
    imageUrl: string | null;
    majors: Major[];
}

interface Scholarship {
    id: number;
    name: string;
    criteriaDescription: string;
    valueDescription: string;
}

interface Tuition {
    id: number;
    programName: string;
    feeAmount: string;
    description: string;
}

interface UniversityEvent {
    id: number;
    title: string;
    date: string; // "YYYY-MM-DD HH:mm:ss"
    description: string;
    location: string;
    imageUrl: string | null;
    link: string | null;
}

interface StudentLifeImage {
    id: number;
    name: string;
    imageUrl: string;
}

interface TrialProgram {
    id: number;
    name: string;
    description: string;
    coverImageUrl: string | null;
}

interface UniversityDetails {
    id: number;
    name: string;
    shortName: string;
    logoUrl: string | null;
    coverImageUrl: string | null;
    email: string;
    phone: string;
    website: string;
    address: string;
    slogan: string;
    introduction: string;
    highlight: string;
    videoIntroUrl: string | null;
    googleMapEmbedUrl: string | null;
    faculties: Faculty[];
    scholarshipPrograms: Scholarship[];
    tuitionPrograms: Tuition[];
    universityEvents: UniversityEvent[];
    universityFacilities: any[];
    universityStudentLifeImages: StudentLifeImage[];
    trialPrograms: TrialProgram[];
}

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2VlZSI+PHBhdGggZD0iTTIxIDNINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY1YzAtMS4xLS45LTItMi0yem0wIDE2SDVWNWgxNHYxNHptLTUuNS02LjVjMC0xLjM4LTEuMTItMi41LTIuNS0yLjVzLTIuNSAxLjEyLTIuNSAyLjUgMS4xMiAyLjUgMi41IDIuNSAyLjUtMS4xMiAyLjUtMi41ek0xNyAxNC41bC0xLjI1LTEuNTgtMi4xNyAyLjU3TDExLjUgMTNsLTIuMjUgMy4wMUg3di0yaDEwbC0xLjYyLTIuMTR6Ii8+PC9zdmc+";


// --- Các Component con ---
const TrialCourseCard = ({ course }: { course: TrialProgram }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col">
        <Image src={course.coverImageUrl || "https://placehold.co/400x250/3498db/ffffff?text=Khóa+Học"} alt={`Hình ảnh khóa học ${course.name}`} width={400} height={250} className="w-full h-48 object-cover" unoptimized/>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex-grow">{course.name}</h3>
            <p className="text-gray-700 text-sm mb-4 h-20 overflow-hidden">{course.description}</p>
            <div className="mt-auto">
                <Link href={`/hoc-thu/chi-tiet/${course.id}`} className="inline-block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out">
                    Học thử ngay
                </Link>
            </div>
        </div>
    </div>
);

const EventCard = ({ event }: { event: UniversityEvent }) => {
    const eventDate = useMemo(() => new Date(event.date.replace(" ", "T")), [event.date]);
    const formattedDate = eventDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col md:flex-row">
            <Image src={event.imageUrl || "https://placehold.co/600x300/e67e22/ffffff?text=Sự+Kiện"} alt={event.title} width={600} height={300} className="w-full md:w-1/3 h-48 md:h-auto object-cover" unoptimized/>
            <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-sm text-blue-600 font-medium mb-1 flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-2 shrink-0" /> {formattedDate} - {formattedTime}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2 shrink-0" /> {event.location}
                    </p>
                    <p className="text-gray-700 text-sm mb-4">{event.description}</p>
                </div>
                {event.link && (
                    <Link href={event.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-auto text-right text-blue-600 hover:text-blue-800 font-semibold text-sm self-end">
                        Xem chi tiết →
                    </Link>
                )}
            </div>
        </div>
    );
};


// --- Component Trang Chính ---
const ChiTietTruongPage = () => {
    const params = useParams();
    const schoolId = params.id;

    const [schoolDetails, setSchoolDetails] = useState<UniversityDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!schoolId) {
            setIsLoading(false);
            setError("Không tìm thấy ID của trường.");
            return;
        }

        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/v1/universities/public/detail/${schoolId}`);
                if (!response.ok) {
                    throw new Error('Không tìm thấy thông tin trường.');
                }
                const result = await response.json();
                if (result.success && result.data) {
                    setSchoolDetails(result.data);
                } else {
                    throw new Error(result.message || 'Lỗi khi tải dữ liệu từ server.');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không mong muốn.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [schoolId]);

    const [openFacultyId, setOpenFacultyId] = useState<number | null>(null);

    useEffect(() => {
        if (schoolDetails && schoolDetails.faculties.length > 0) {
            setOpenFacultyId(schoolDetails.faculties[0].id);
        }
    }, [schoolDetails]);

    const getYouTubeEmbedUrl = (url: string | undefined | null): string => {
        if (!url) return '';
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(youtubeRegex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : '';
    };
    const StudentLifeImageCard = ({ image }: { image: StudentLifeImage }) => {
        const [isHovering, setIsHovering] = useState(false);

        return (
            <div
                className="relative rounded-lg overflow-hidden shadow-md"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <Image
                    src={image.imageUrl}
                    alt={image.name}
                    width={400}
                    height={400}
                    className="w-full h-40 md:h-48 object-cover transition-transform duration-300"
                    unoptimized
                />
                <div
                    className={`absolute inset-0 bg-black bg-opacity-60 text-white flex items-center justify-center opacity-0 transition-opacity duration-300 ${isHovering ? 'opacity-100' : ''}`}
                >
                    <p className="text-center text-sm md:text-base font-semibold px-4">{image.name}</p>
                </div>
            </div>
        );
    };
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    if (!schoolDetails) {
        return <div className="flex justify-center items-center h-screen">Không có dữ liệu để hiển thị.</div>;
    }

    const embedVideoUrl = getYouTubeEmbedUrl(schoolDetails.videoIntroUrl);
    const highlightsArray = schoolDetails.highlight ? schoolDetails.highlight.split('\n').filter(line => line.trim() !== '') : [];

    return (
        <div className={`bg-gray-50 pt-28`}>
            {/* Phần Hero Banner và Giới thiệu giữ nguyên */}
            <section className="relative bg-cover bg-center py-24 md:py-32 lg:py-40" style={{ backgroundImage: `url(${schoolDetails.coverImageUrl})` }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <Image src={schoolDetails.logoUrl || ''} alt={`Logo ${schoolDetails.name}`} width={80} height={80} className="mx-auto mb-6 h-16 md:h-20 object-contain" unoptimized/>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{schoolDetails.name}</h1>
                    {schoolDetails.slogan && <p className="text-xl md:text-2xl italic mb-8">{schoolDetails.slogan}</p>}
                    <Link href="#khoa-hoc-thu" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                        Xem các Khóa học thử
                    </Link>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link href="/danh-sach-truong" className="inline-flex items-center text-blue-600 hover:text-blue-800 group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại danh sách trường
                    </Link>
                </div>

                <section id="gioi-thieu" className="mb-16">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Chào mừng đến với {schoolDetails.name}</h2>
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
                        <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-start">
                            <div className="md:col-span-3">
                                <p className="text-gray-700 leading-relaxed mb-6">{schoolDetails.introduction}</p>
                                {highlightsArray.length > 0 && <>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Điểm nổi bật:</h4>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 pl-5">
                                        {highlightsArray.map((highlight, index) => <li key={index}>{highlight}</li>)}
                                    </ul>
                                </>}
                            </div>
                            {embedVideoUrl && (
                                <div className="md:col-span-2 flex md:justify-end items-center mt-6 md:mt-0">
                                    <div className="w-full max-w-md aspect-video rounded-lg overflow-hidden shadow-xl">
                                        <iframe src={embedVideoUrl} title={`Video giới thiệu ${schoolDetails.name}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ================================================================== */}
                {/* ======= THAY THẾ TOÀN BỘ SECTION "ĐÀO TẠO" BẰNG PHIÊN BẢN NÂNG CẤP NÀY ======= */}
                {/* ================================================================== */}
                {schoolDetails.faculties && schoolDetails.faculties.length > 0 && (
                    <section id="dao-tao" className="mb-16">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Chương trình Đào tạo</h2>

                        {/* Container cho toàn bộ Accordion */}
                        <div className="max-w-5xl mx-auto space-y-4">
                            {schoolDetails.faculties.map((faculty) => {
                                // Kiểm tra xem khoa hiện tại có đang mở không
                                const isOpen = openFacultyId === faculty.id;

                                return (
                                    <div key={faculty.id} className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg bg-white">
                                        {/* Header của Accordion (Phần luôn hiển thị và có thể click) */}
                                        <button
                                            onClick={() => setOpenFacultyId(isOpen ? null : faculty.id)}
                                            className="w-full flex justify-between items-center p-5 md:p-6 text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                {faculty.imageUrl && (
                                                    <Image
                                                        src={faculty.imageUrl}
                                                        alt={`Logo Khoa ${faculty.name}`}
                                                        width={64}
                                                        height={64}
                                                        className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-md flex-shrink-0"
                                                        unoptimized
                                                    />
                                                )}
                                                <h3 className="text-xl md:text-2xl font-bold text-blue-800">
                                                    {faculty.name}
                                                </h3>
                                            </div>

                                            {/* Icon mũi tên xoay theo trạng thái */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-7 w-7 text-blue-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2.5}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Content của Accordion (Phần xổ xuống) */}
                                        <div
                                            className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="px-5 md:px-6 pb-6 pt-2">
                                                <div className="border-t border-gray-200 pt-6">
                                                    {faculty.majors && faculty.majors.length > 0 ? (
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                            {faculty.majors.map((major) => (
                                                                <div key={major.id} className="flex items-start bg-sky-50 p-4 rounded-xl">
                                                                    <div className="flex-shrink-0">
                                                                        <Image
                                                                            src={major.imageUrl || "https://placehold.co/400x400/95a5a6/ffffff?text=Ngành"}
                                                                            alt={`Hình ảnh ngành ${major.name}`}
                                                                            width={80}
                                                                            height={80}
                                                                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow"
                                                                            unoptimized
                                                                        />
                                                                    </div>
                                                                    <div className="ml-4 flex-1">
                                                                        <h4 className="text-lg font-semibold text-gray-900">{major.name}</h4>
                                                                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{major.description || 'Chưa có mô tả chi tiết.'}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-center text-gray-500">Chưa có thông tin về các ngành học của khoa này.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-center mt-12">
                            <a href={schoolDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline text-lg">
                                Xem chi tiết thông tin tuyển sinh của trường →
                            </a>
                        </div>
                    </section>
                )}

                {/* Các phần còn lại giữ nguyên */}
                {/* ... (Khóa học thử, Sự kiện, Học phí, v.v...) ... */}
                {schoolDetails.trialPrograms && schoolDetails.trialPrograms.length > 0 && (
                    <section id="khoa-hoc-thu" className="mb-16 bg-sky-50 py-12 rounded-xl px-6">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Trải nghiệm <span className="text-blue-600">{schoolDetails.name}</span> với các Khóa học thử</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {schoolDetails.trialPrograms.map(course => <TrialCourseCard key={course.id} course={course} />)}
                        </div>
                    </section>
                )}
                {schoolDetails.universityEvents && schoolDetails.universityEvents.length > 0 && (
                    <section id="su-kien" className="mb-16">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Sự kiện Nổi bật</h2>
                        <div className="space-y-8">
                            {schoolDetails.universityEvents.map(event => <EventCard key={event.id} event={event} />)}
                        </div>
                    </section>
                )}
                {schoolDetails.tuitionPrograms && schoolDetails.tuitionPrograms.length > 0 && (
                    <section id="hoc-phi" className="mb-16 bg-gray-100 py-12 rounded-xl px-6">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Thông tin Học phí</h2>
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                            {schoolDetails.tuitionPrograms.map((program) => (
                                <div key={program.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                                    <h4 className="text-lg font-semibold text-blue-700">{program.programName}</h4>
                                    <p className="text-gray-800"><strong>Mức học phí:</strong> {new Intl.NumberFormat('vi-VN').format(Number(program.feeAmount))} VNĐ</p>
                                    {program.description && <p className="text-sm text-gray-600"><em>Ghi chú: {program.description}</em></p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {schoolDetails.scholarshipPrograms && schoolDetails.scholarshipPrograms.length > 0 && (
                    <section id="hoc-bong" className="mb-16">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Chính sách Học bổng</h2>
                        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
                            {schoolDetails.scholarshipPrograms.map((scholarship) => (
                                <div key={scholarship.id} className="mb-6 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                                    <h4 className="text-lg font-semibold text-green-700">{scholarship.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1"><strong>Đối tượng & Tiêu chí:</strong> {scholarship.criteriaDescription}</p>
                                    <p className="text-sm text-gray-600"><strong>Giá trị:</strong> {scholarship.valueDescription}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* ================================================================== */}
                {/* ======= THAY THẾ TOÀN BỘ SECTION "ĐỜI SỐNG SINH VIÊN" BẰNG PHIÊN BẢN NÀY ======= */}
                {/* ================================================================== */}

                {schoolDetails.universityStudentLifeImages && schoolDetails.universityStudentLifeImages.length > 0 && (
                    <section id="doi-song-sinh-vien" className="mb-16">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Đời sống Sinh viên Sôi động</h2>
                        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
                            Khám phá những khoảnh khắc đáng nhớ, các hoạt động ngoại khóa và môi trường học tập năng động qua những hình ảnh chân thực nhất.
                        </p>
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {schoolDetails.universityStudentLifeImages.map((image) => (
                                    // Đây là component card ảnh đã được thiết kế lại hoàn toàn
                                    <div key={image.id} className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg">
                                        {/* 1. Phần ảnh với hiệu ứng zoom */}
                                        <Image
                                            src={image.imageUrl || placeholderImage}
                                            alt={image.name}
                                            width={400}
                                            height={400}
                                            className="w-full h-56 object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                                            unoptimized
                                        />

                                        {/* 2. Lớp phủ Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                                        {/* 3. Phần chữ mô tả với hiệu ứng trượt lên */}
                                        <div className="absolute bottom-0 left-0 w-full p-4 transition-all duration-500 ease-in-out transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                                            <h4 className="text-white text-lg font-bold drop-shadow-md">{image.name}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                <section id="lien-he" className="bg-gray-100 py-12 rounded-xl px-6">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Liên hệ</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Thông tin liên hệ {schoolDetails.name}:</h3>
                            <p className="text-gray-700 mb-2"><strong>Địa chỉ:</strong> {schoolDetails.address}</p>
                            <p className="text-gray-700 mb-2"><strong>Điện thoại:</strong> {schoolDetails.phone}</p>
                            <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href={`mailto:${schoolDetails.email}`} className="text-blue-600 hover:underline">{schoolDetails.email}</a></p>
                            <p className="text-gray-700 mb-4"><strong>Website:</strong> <a href={schoolDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{schoolDetails.website}</a></p>
                        </div>
                        {schoolDetails.googleMapEmbedUrl && (
                            <div className="bg-white p-2 rounded-lg shadow-md">
                                <div className="aspect-video w-full rounded-lg overflow-hidden">
                                    <iframe
                                        src={schoolDetails.googleMapEmbedUrl}
                                        width="100%" height="100%" style={{ border: 0 }}
                                        allowFullScreen={true} loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`Bản đồ vị trí ${schoolDetails.name}`}
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ChiTietTruongPage;
