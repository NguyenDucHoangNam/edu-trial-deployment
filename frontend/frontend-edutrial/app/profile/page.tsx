// app/profile/page.tsx

"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth, UserInfo } from "@/app/context/AuthContext";

// Hàm trợ giúp để chuyển đổi mọi định dạng ngày tháng về YYYY-MM-DD
const formatDateForInput = (date: any): string => {
    if (!date) return "";

    // Nếu là chuỗi (đã đúng định dạng hoặc có T...Z)
    if (typeof date === 'string') {
        return date.substring(0, 10);
    }

    // Nếu là mảng số (dữ liệu cũ bị lỗi [YYYY, M, D])
    if (Array.isArray(date)) {
        const [year, month, day] = date;
        // Thêm số 0 vào trước tháng/ngày nếu cần
        const paddedMonth = String(month).padStart(2, '0');
        const paddedDay = String(day).padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
    }

    return ""; // Trả về chuỗi rỗng nếu không thể xử lý
};

const ProfilePage = () => {
    const { token, user, updateUser } = useAuth();

    // Hàm khởi tạo state ban đầu với dữ liệu đã được xử lý
    const getInitialProfile = () => {
        if (!user) return null;
        const initialUser = { ...user };
        initialUser.dob = formatDateForInput(initialUser.dob);
        return initialUser;
    };

    const [profile, setProfile] = useState<UserInfo | null>(getInitialProfile());
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);

    const fetchProfile = async () => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        // Không cần setIsLoading(true) ở đây nữa nếu đã có dữ liệu ban đầu
        if (!profile) {
            setIsLoading(true);
        }
        
        try {
            const response = await fetch("/api/v1/users/me/profile", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Không thể tải thông tin cá nhân.");

            const data: UserInfo = await response.json();
            data.dob = formatDateForInput(data.dob); // Luôn xử lý dữ liệu trả về
            
            setProfile(data);
            if (!avatarFile) setAvatarPreview(data.avatar);
        } catch (error) {
            console.error("Lỗi khi tải profile:", error);
            toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!profile || !token) return;
        setIsUpdating(true);

        const profileData = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            address: profile.address,
            dob: profile.dob, // dob đã ở định dạng YYYY-MM-DD
        };
        const formData = new FormData();
        formData.append("profileData", JSON.stringify(profileData));
        if (avatarFile) formData.append("avatarFile", avatarFile);

        try {
            const response = await fetch("/api/v1/users/me/profile", {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Cập nhật thất bại.");

            toast.success(result.message || "Cập nhật thông tin thành công!");
            
            // Xử lý dữ liệu trả về trước khi cập nhật context và state
            const updatedData = result.data;
            updatedData.dob = formatDateForInput(updatedData.dob);

            updateUser(updatedData);
            setProfile(updatedData);
            setAvatarFile(null);
        } catch (error) {
            console.error("Lỗi khi cập nhật profile:", error);
            toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading && !profile) {
        return <div className="container mx-auto text-center py-20">Đang tải dữ liệu...</div>;
    }
    if (!profile) {
        return <div className="container mx-auto text-center py-20">Vui lòng đăng nhập để xem thông tin.</div>;
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <section className="py-16 md:py-20 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-dark p-6 sm:p-8 rounded-lg shadow-lg">
                        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-6 border-b border-body-color/20 pb-4">Hồ sơ cá nhân</h1>
                        <form onSubmit={handleUpdateProfile} noValidate>
                            {/* Phần JSX cho form giữ nguyên, nó sẽ hoạt động đúng với profile state đã được xử lý */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <Image
                                            src={avatarPreview || "/images/profile/user-icon-modern.svg"}
                                            alt="Avatar" width={160} height={160}
                                            className="rounded-full w-40 h-40 object-cover border-4 border-gray-200 dark:border-gray-700"
                                            priority unoptimized/>
                                        <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full cursor-pointer hover:bg-opacity-90 transition-transform transform hover:scale-110" title="Đổi ảnh đại diện">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                            <input type="file" id="avatarUpload" className="hidden" accept="image/png, image/jpeg, image/gif" onChange={handleAvatarChange} />
                                        </label>
                                    </div>
                                    <p className="text-xl font-semibold text-black dark:text-white capitalize">{profile.name}</p>
                                    <p className="text-sm text-body-color dark:text-gray-400">{profile.email}</p>
                                </div>
                                <div className="md:col-span-2 space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium mb-1.5 text-dark dark:text-white">Họ</label>
                                            <input type="text" id="firstName" value={profile.firstName || ""} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium mb-1.5 text-dark dark:text-white">Tên</label>
                                            <input type="text" id="lastName" value={profile.lastName || ""} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium mb-1.5 text-dark dark:text-white">Số điện thoại</label>
                                        <input type="tel" id="phone" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                                    </div>
                                    <div>
                                        <label htmlFor="dob" className="block text-sm font-medium mb-1.5 text-dark dark:text-white">Ngày sinh</label>
                                        <input type="date" id="dob" value={profile.dob || ""} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium mb-1.5 text-dark dark:text-white">Địa chỉ</label>
                                        <input type="text" id="address" value={profile.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark-6 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-body-color/20 flex justify-end">
                                <button type="submit" disabled={isUpdating} className="ease-in-up shadow-btn hover:shadow-btn-hover rounded-md bg-primary px-8 py-3 text-base font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none">
                                    {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProfilePage;