// app/my-university/page.tsx

"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link"; // <-- Thêm import cho Link
import { usePathname } from "next/navigation"; // <-- Thêm import cho usePathname
import { useAuth } from "@/app/context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// --- Dữ liệu cho Menu điều hướng ---
// Bạn có thể dễ dàng thêm/bớt các mục quản lý ở đây
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


// Định nghĩa kiểu dữ liệu cho University Profile
interface UniversityProfile {
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
}

// Hàm khởi tạo dữ liệu mặc định nếu chưa có profile
const createDefaultProfile = (): Partial<UniversityProfile> => ({
    name: "", shortName: "", logoUrl: null, coverImageUrl: null, email: "", phone: "", website: "", address: "", slogan: "", introduction: "", highlight: "", videoIntroUrl: null, googleMapEmbedUrl: null,
});


const MyUniversityPage = () => {
    const { token } = useAuth();
    const pathname = usePathname(); // <-- Lấy đường dẫn hiện tại để highlight tab
    const [profile, setProfile] = useState<Partial<UniversityProfile> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

    // Toàn bộ các hàm logic (useEffect, handleInputChange, ...) giữ nguyên
    useEffect(() => {
        const fetchUniversityProfile = async () => {
            if (!token) {
                setIsLoading(false);
                toast.error("Vui lòng đăng nhập để truy cập.");
                return;
            }
            try {
                const response = await fetch("/api/v1/universities/my-profile", {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (response.status === 404) {
                    setProfile(createDefaultProfile());
                    toast.info("Bạn chưa có thông tin trường. Hãy điền vào form để tạo mới.");
                    return;
                }

                if (!response.ok) throw new Error("Không thể tải dữ liệu của trường.");

                const result = await response.json();
                if (result.success && result.data) {
                    setProfile(result.data);
                    setLogoPreview(result.data.logoUrl);
                    setCoverImagePreview(result.data.coverImageUrl);
                } else {
                    throw new Error(result.message || "Lỗi khi lấy dữ liệu.");
                }
            } catch (error) {
                console.error("Lỗi fetchUniversityProfile:", error);
                toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
                setProfile(createDefaultProfile());
            } finally {
                setIsLoading(false);
            }
        };

        fetchUniversityProfile();
    }, [token]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImageFile(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile || !token) return;

        setIsUpdating(true);
        const formData = new FormData();

        const profileData = { name: profile.name, shortName: profile.shortName, email: profile.email, phone: profile.phone, website: profile.website, address: profile.address, slogan: profile.slogan, introduction: profile.introduction, highlight: profile.highlight, videoIntroUrl: profile.videoIntroUrl, googleMapEmbedUrl: profile.googleMapEmbedUrl };

        const profileBlob = new Blob([JSON.stringify(profileData)], { type: "application/json" });
        formData.append('profileData', profileBlob);

        if (logoFile) formData.append('logoFile', logoFile);
        if (coverImageFile) formData.append('coverImageFile', coverImageFile);

        try {
            const response = await fetch("/api/v1/universities/my-profile", {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Cập nhật thất bại.");

            toast.success(result.message || "Cập nhật thông tin trường thành công!");

            setProfile(result.data);
            setLogoPreview(result.data.logoUrl);
            setCoverImagePreview(result.data.coverImageUrl);
            setLogoFile(null);
            setCoverImageFile(null);

        } catch (error) {
            console.error("Lỗi handleFormSubmit:", error);
            toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="container mx-auto text-center py-20">Đang tải...</div>;
    }

    if (!profile) {
        return <div className="container mx-auto text-center py-20 text-red-500">Không thể tải form. Vui lòng thử lại.</div>;
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <section className="py-16 md:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto"> {/* Bỏ shadow ở đây để đưa vào form */}

                        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6">
                            Quản lý trường
                        </h1>

                        {/* --- THANH ĐIỀU HƯỚNG DẠNG TAB --- */}
                        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {navLinks.map((tab) => (
                                    <Link
                                        key={tab.name}
                                        href={tab.href}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${pathname === tab.href
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        {tab.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        {/* --- KẾT THÚC THANH ĐIỀU HƯỚNG --- */}

                        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-dark p-6 sm:p-8 rounded-lg shadow-lg">
                            {/* Phần Form giữ nguyên hoàn toàn */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1 space-y-8">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Logo</label>
                                        <div className="relative w-48 h-48 mx-auto border-2 border-dashed rounded-full flex items-center justify-center">
                                            <Image src={logoPreview || '/images/placeholder/logo-placeholder.svg'} alt="Logo Preview" layout="fill" objectFit="contain" className="rounded-full p-2" unoptimized/>
                                            <label htmlFor="logoUpload" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full">Tải lên</label>
                                            <input id="logoUpload" type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-dark dark:text-white">Ảnh bìa</label>
                                        <div className="relative w-full aspect-video border-2 border-dashed rounded-lg flex items-center justify-center">
                                            <Image src={coverImagePreview || '/images/placeholder/cover-placeholder.svg'} alt="Cover Preview" layout="fill" objectFit="cover" className="rounded-lg" unoptimized/>
                                            <label htmlFor="coverUpload" className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-lg">Tải lên</label>
                                            <input id="coverUpload" type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-2 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <InputField label="Tên trường" name="name" value={profile.name} onChange={handleInputChange} required />
                                        <InputField label="Tên viết tắt" name="shortName" value={profile.shortName} onChange={handleInputChange} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <InputField label="Email liên hệ" name="email" type="email" value={profile.email} onChange={handleInputChange} required />
                                        <InputField label="Số điện thoại" name="phone" value={profile.phone} onChange={handleInputChange} required />
                                    </div>
                                    <InputField label="Website" name="website" value={profile.website} onChange={handleInputChange} />
                                    <InputField label="Địa chỉ" name="address" value={profile.address} onChange={handleInputChange} required />
                                    <InputField label="Slogan" name="slogan" value={profile.slogan} onChange={handleInputChange} />
                                    <TextAreaField label="Giới thiệu trường" name="introduction" value={profile.introduction} onChange={handleInputChange} rows={5} />
                                    <TextAreaField label="Điểm nổi bật" name="highlight" value={profile.highlight} onChange={handleInputChange} rows={3} />
                                    <InputField label="URL Video giới thiệu (YouTube)" name="videoIntroUrl" value={profile.videoIntroUrl} onChange={handleInputChange} />
                                    <InputField label="URL nhúng Google Map" name="googleMapEmbedUrl" value={profile.googleMapEmbedUrl} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-body-color/20 flex justify-end">
                                <button type="submit" disabled={isUpdating} className="ease-in-up shadow-btn hover:shadow-btn-hover rounded-md bg-primary px-8 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none">
                                    {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

const InputField = ({ label, name, type = "text", value, onChange, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-dark dark:text-white">{label}</label>
        <input type={type} id={name} name={name} value={value || ''} onChange={onChange} required={required}
            className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
    </div>
);

const TextAreaField = ({ label, name, value, onChange, rows = 3 }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium mb-1.5 text-dark dark:text-white">{label}</label>
        <textarea id={name} name={name} value={value || ''} onChange={onChange} rows={rows}
            className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
    </div>
);

export default MyUniversityPage;