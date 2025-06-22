'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loginApi, verifyOtpApi, resendOtpApi } from '@/services/authService';
import { useAuth } from '@/app/context/AuthContext';
import { showError, showSuccess } from '@/utils/toastService';

const VerifyOtpPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const { login } = useAuth();

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (!email) router.push('/signup');
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        try {
            await verifyOtpApi({ email, otp });
            const password = localStorage.getItem('registerPassword') ?? '';
            if (!password) {
                showError('Không tìm thấy mật khẩu đăng ký. Vui lòng đăng nhập lại.');
                router.push(`/signin?email=${email}`);
                return;
            }
            const data = await loginApi({ email, password });
            login(data.user, data.accessToken);
            localStorage.removeItem('registerPassword');
            showSuccess('🎉 Đăng ký thành công! Chào mừng bạn đến với nền tảng của chúng tôi!');
            router.push('/');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? '❌ Mã OTP không hợp lệ hoặc đã hết hạn.';
            setError(msg);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccessMsg('');
        try {
            const response = await resendOtpApi(email);
            if (response?.success) {
                setSuccessMsg(response.message || '✅ Mã OTP mới đã được gửi đến email của bạn.');
            } else {
                setError(response.message || '❌ Gửi lại thất bại.');
            }
        } catch {
            setError('❌ Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f172a] px-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                    Xác minh tài khoản
                </h2>
                <p className="text-center text-sm text-gray-500 dark:text-gray-300 mb-6">
                    Mã OTP đã được gửi đến <strong>{email}</strong>
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Nhập mã OTP
                        </label>
                        <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="123456"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    {successMsg && <p className="text-sm text-green-500 text-center">{successMsg}</p>}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 rounded-md transition duration-300"
                    >
                        Xác minh & Đăng nhập
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleResend}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Gửi lại mã OTP
                    </button>
                </div>
            </div>
        </section>
    );
};

export default VerifyOtpPage;
