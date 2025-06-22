"use client";

import { useState, ChangeEvent, FormEvent } from 'react';

interface SubjectScore {
    id: string;
    name: string;
    score: string;
}

const initialThptScores: SubjectScore[] = [
    { id: 'toan', name: 'Toán', score: '' },
    { id: 'van', name: 'Ngữ văn', score: '' },
    { id: 'ngoaiNgu', name: 'Ngoại ngữ', score: '' },
];

const khtnSubjects: SubjectScore[] = [
    { id: 'vatLy', name: 'Vật lí', score: '' },
    { id: 'hoaHoc', name: 'Hóa học', score: '' },
    { id: 'sinhHoc', name: 'Sinh học', score: '' },
];

const khxhSubjects: SubjectScore[] = [
    { id: 'lichSu', name: 'Lịch sử', score: '' },
    { id: 'diaLy', name: 'Địa lí', score: '' },
    { id: 'gdcd', name: 'Giáo dục công dân', score: '' },
];

export default function TinhDiemTHPTPage() {
    const [monThiTotNghiep, setMonThiTotNghiep] = useState<SubjectScore[]>(initialThptScores);
    const [chonToHop, setChonToHop] = useState<'KHTN' | 'KHXH' | ''>('');
    const [diemMonToHop, setDiemMonToHop] = useState<SubjectScore[]>([]);

    const [diemTBLop10, setDiemTBLop10] = useState<string>('');
    const [diemTBLop11, setDiemTBLop11] = useState<string>('');
    const [diemTBLop12, setDiemTBLop12] = useState<string>('');

    const [diemKhuyenKhich, setDiemKhuyenKhich] = useState<string>('');
    const [diemUuTien, setDiemUuTien] = useState<string>('');

    const [diemXetTotNghiep, setDiemXetTotNghiep] = useState<number | null>(null);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    const handleMonThiTotNghiepChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        const newScores = [...monThiTotNghiep];
        newScores[index].score = event.target.value;
        setMonThiTotNghiep(newScores);
    };

    const handleToHopChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value as 'KHTN' | 'KHXH';
        setChonToHop(value);
        if (value === 'KHTN') {
            setDiemMonToHop(khtnSubjects.map(s => ({ ...s, score: '' })));
        } else if (value === 'KHXH') {
            setDiemMonToHop(khxhSubjects.map(s => ({ ...s, score: '' })));
        } else {
            setDiemMonToHop([]);
        }
    };

    const handleDiemMonToHopChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        const newScores = [...diemMonToHop];
        newScores[index].score = event.target.value;
        setDiemMonToHop(newScores);
    };

    const validateScoresArray = (scores: SubjectScore[], required: boolean = true): { valid: boolean; errors: string[] } => {
        let valid = true;
        const currentErrors: string[] = [];
        scores.forEach(subject => {
            if (subject.score === '' && required) {
                valid = false;
                currentErrors.push(`Điểm môn ${subject.name} không được để trống.`);
                return;
            }
            const scoreVal = parseFloat(subject.score);
            if (subject.score !== '' && (isNaN(scoreVal) || scoreVal < 0 || scoreVal > 10)) {
                valid = false;
                currentErrors.push(`Điểm môn ${subject.name} không hợp lệ (phải từ 0 đến 10).`);
            }
        });
        return { valid, errors: currentErrors };
    };

    const validateSingleScore = (scoreStr: string, name: string, canBeEmpty: boolean = false, maxScore: number = 10): { valid: boolean; error: string | null } => {
        if (scoreStr === '' && canBeEmpty) return { valid: true, error: null };
        if (scoreStr === '' && !canBeEmpty) return { valid: false, error: `${name} không được để trống.` };

        const scoreVal = parseFloat(scoreStr);
        if (name.toLowerCase().includes("khuyến khích")) {
            if (isNaN(scoreVal) || scoreVal < 0) {
                return { valid: false, error: `${name} không hợp lệ (phải là số không âm).` };
            }
        } else {
            if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > maxScore) {
                return { valid: false, error: `${name} không hợp lệ (phải từ 0 đến ${maxScore}).` };
            }
        }
        return { valid: true, error: null };
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDiemXetTotNghiep(null);
        setErrorMessages([]);
        let currentErrors: string[] = [];

        const monThiTNVAlidation = validateScoresArray(monThiTotNghiep);
        if (!monThiTNVAlidation.valid) currentErrors.push(...monThiTNVAlidation.errors);

        if (!chonToHop) {
            currentErrors.push("Bạn chưa chọn tổ hợp môn (KHTN hoặc KHXH).");
        } else {
            const diemMonToHopValidation = validateScoresArray(diemMonToHop);
            if (!diemMonToHopValidation.valid) currentErrors.push(...diemMonToHopValidation.errors);
        }

        const diemTBLop10Validation = validateSingleScore(diemTBLop10, "Điểm TB lớp 10");
        if (!diemTBLop10Validation.valid && diemTBLop10Validation.error) currentErrors.push(diemTBLop10Validation.error);

        const diemTBLop11Validation = validateSingleScore(diemTBLop11, "Điểm TB lớp 11");
        if (!diemTBLop11Validation.valid && diemTBLop11Validation.error) currentErrors.push(diemTBLop11Validation.error);

        const diemTBLop12Validation = validateSingleScore(diemTBLop12, "Điểm TB lớp 12");
        if (!diemTBLop12Validation.valid && diemTBLop12Validation.error) currentErrors.push(diemTBLop12Validation.error);

        const diemKhuyenKhichValidation = validateSingleScore(diemKhuyenKhich, "Điểm Khuyến khích", true, 100);
        if (!diemKhuyenKhichValidation.valid && diemKhuyenKhichValidation.error) currentErrors.push(diemKhuyenKhichValidation.error);

        const diemUuTienValidation = validateSingleScore(diemUuTien, "Điểm Ưu tiên", true, 2.75);
        if (!diemUuTienValidation.valid && diemUuTienValidation.error) currentErrors.push(diemUuTienValidation.error);

        if (currentErrors.length > 0) {
            setErrorMessages(currentErrors);
            return;
        }

        const toan = parseFloat(monThiTotNghiep.find(s => s.id === 'toan')?.score || '0') || 0;
        const van = parseFloat(monThiTotNghiep.find(s => s.id === 'van')?.score || '0') || 0;
        const ngoaiNgu = parseFloat(monThiTotNghiep.find(s => s.id === 'ngoaiNgu')?.score || '0') || 0;

        let diemTBToHop = 0;
        const diemCacMonToHop = diemMonToHop.map(s => parseFloat(s.score) || 0);
        if (diemCacMonToHop.length > 0) {
            const sumToHop = diemCacMonToHop.reduce((sum, score) => sum + score, 0);
            diemTBToHop = sumToHop / diemCacMonToHop.length;
        }

        const tongDiem4MonThi = toan + van + ngoaiNgu + diemTBToHop;
        const tongDiemKK = parseFloat(diemKhuyenKhich) || 0;

        const dtb10 = parseFloat(diemTBLop10) || 0;
        const dtb11 = parseFloat(diemTBLop11) || 0;
        const dtb12 = parseFloat(diemTBLop12) || 0;

        const dtbCacNamHoc = (dtb10 * 1 + dtb11 * 2 + dtb12 * 3) / 6;
        const diemUT = parseFloat(diemUuTien) || 0;

        const phanTrongNgoacDon = ((tongDiem4MonThi + tongDiemKK) / 4) + dtbCacNamHoc;
        const dxtn_calculated = (phanTrongNgoacDon / 2) + diemUT;

        let coDiemLiet = false;
        const tatCaDiemThi = [toan, van, ngoaiNgu, ...diemCacMonToHop];
        for (const diem of tatCaDiemThi) {
            if (diem <= 1.0) {
                coDiemLiet = true;
                break;
            }
        }

        if (coDiemLiet) {
            currentErrors.push("Có môn thi bị điểm liệt (<= 1.0 điểm). Không đủ điều kiện xét tốt nghiệp.");
            setErrorMessages(currentErrors);
            setDiemXetTotNghiep(null);
        } else {
            setDiemXetTotNghiep(Math.round(dxtn_calculated * 100) / 100);
        }
    };

    return (
        <section className="pb-[20px] pt-[90px] ">
            <div className="bg-gradient-to-b from-sky-100 to-blue-100 min-h-screen py-8 sm:py-12 px-4">
                {/* Thêm một div container bên trong để giữ max-width và auto margin cho card nội dung */}
                <div className="container mx-auto">
                    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-3xl mx-auto"> {/* Có thể tăng shadow lên shadow-2xl */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6">
                            Công cụ tính điểm xét tốt nghiệp THPT 2025
                        </h1>

                        {/* Phần hiển thị công thức (giữ nguyên) */}
                        <div className="mb-8 p-4 bg-sky-50 border border-sky-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-sky-700 mb-4">Công thức tính điểm áp dụng (tham khảo):</h3>
                            <div className="space-y-6 text-sm text-gray-700">
                                {/* Công thức ĐTB các năm học */}
                                <div>
                                    <p className="font-medium mb-1">1. Điểm trung bình các năm học (ĐTB các năm học):</p>
                                    <div className="flex items-center justify-center sm:justify-start">
                                        <span className="font-semibold mr-2">ĐTB các năm học =</span>
                                        <div className="inline-flex flex-col items-center text-center leading-tight">
                                            <span className="px-1 pb-0.5 text-xs sm:text-sm">
                                                (ĐTB lớp 10 × 1) + (ĐTB lớp 11 × 2) + (ĐTB lớp 12 × 3)
                                            </span>
                                            <span className="w-full border-t-2 border-current h-px"></span>
                                            <span className="pt-0.5 text-xs sm:text-sm">6</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Công thức ĐXTN */}
                                <div>
                                    <p className="font-medium mb-1">2. Điểm xét tốt nghiệp (ĐXTN):</p>
                                    <div className="flex items-center justify-center sm:justify-start flex-wrap">
                                        <span className="font-semibold mr-1">ĐXTN =</span>
                                        <div className="inline-flex flex-col items-center text-center leading-tight mx-1">
                                            <div className="px-1 pb-0.5 text-xs sm:text-sm">
                                                <div className="inline-flex flex-col items-center text-center mx-1">
                                                    <span className="px-1 pb-0.5">
                                                        (Tổng điểm 4 môn thi + Tổng điểm KK <span className="text-xs italic">(nếu có)</span>)
                                                    </span>
                                                    <span className="w-full border-t border-current h-px"></span>
                                                    <span className="pt-0.5">4</span>
                                                </div>
                                                <span className="mx-1"> + ĐTB các năm học</span>
                                            </div>
                                            <div className="w-full border-t-2 border-current h-px"></div>
                                            <span className="pt-0.5">2</span>
                                        </div>
                                        <span className="ml-1 font-semibold">&nbsp;+ Điểm ƯT <span className="text-xs italic">(nếu có)</span></span>
                                    </div>
                                    <ul className="list-disc list-inside text-xs text-gray-600 mt-2 pl-4 space-y-0.5">
                                        <li><span className="font-semibold">Tổng điểm 4 môn thi:</span> Toán + Ngữ văn + Ngoại ngữ + Điểm TB môn tổ hợp.</li>
                                        <li><span className="font-semibold">Tổng điểm KK:</span> Tổng điểm khuyến khích được cộng vào điểm thi (VD: điểm nghề).</li>
                                        <li><span className="font-semibold">ĐTB các năm học:</span> Tính theo công thức (1).</li>
                                        <li><span className="font-semibold">Điểm ƯT:</span> Điểm ưu tiên khu vực, đối tượng.</li>
                                    </ul>
                                </div>
                            </div>
                            <p className="text-xs text-rose-600 mt-4 font-semibold">
                                Lưu ý: Công thức trên được cung cấp cho mục đích tham khảo dựa trên thông tin dự kiến cho kỳ thi THPT 2025.
                                Học sinh cần theo dõi và đối chiếu với quy định chính thức từ Bộ Giáo dục và Đào tạo khi được ban hành.
                            </p>
                        </div>

                        {errorMessages.length > 0 && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                                <h3 className="font-semibold mb-2">Vui lòng kiểm tra lại các lỗi sau:</h3>
                                <ul className="list-disc list-inside">
                                    {errorMessages.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Form nhập liệu (giữ nguyên) */}
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Bước 1: Điểm thi tốt nghiệp THPT */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Bước 1: Nhập điểm thi tốt nghiệp THPT
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    {monThiTotNghiep.map((subject, index) => (
                                        <div key={subject.id}>
                                            <label htmlFor={subject.id} className="block text-sm font-medium text-gray-600 mb-1">
                                                {subject.name}:
                                            </label>
                                            <input
                                                type="number" id={subject.id} name={subject.id} value={subject.score}
                                                onChange={(e) => handleMonThiTotNghiepChange(index, e)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder={`Điểm ${subject.name}`} step="0.01" min="0" max="10"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-4">
                                    <p className="block text-sm font-medium text-gray-600 mb-2">Chọn 1 trong 2 tổ hợp môn:</p>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                            <input type="radio" name="toHop" value="KHTN" checked={chonToHop === 'KHTN'} onChange={handleToHopChange} className="form-radio h-4 w-4 text-indigo-600" />
                                            <span>Khoa học Tự nhiên (Lý, Hóa, Sinh)</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                                            <input type="radio" name="toHop" value="KHXH" checked={chonToHop === 'KHXH'} onChange={handleToHopChange} className="form-radio h-4 w-4 text-indigo-600" />
                                            <span>Khoa học Xã hội (Sử, Địa, GDCD)</span>
                                        </label>
                                    </div>
                                </div>
                                {chonToHop && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {diemMonToHop.map((subject, index) => (
                                            <div key={subject.id}>
                                                <label htmlFor={subject.id} className="block text-sm font-medium text-gray-600 mb-1">
                                                    {subject.name} ({chonToHop}):
                                                </label>
                                                <input
                                                    type="number" id={subject.id} name={subject.id} value={subject.score}
                                                    onChange={(e) => handleDiemMonToHopChange(index, e)}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder={`Điểm ${subject.name}`} step="0.01" min="0" max="10"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Bước 2: Nhập điểm trung bình các năm học (Lớp 10, 11, 12) */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Bước 2: Nhập điểm trung bình các năm học
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="diemTBLop10" className="block text-sm font-medium text-gray-600 mb-1">
                                            Điểm TB cả năm lớp 10:
                                        </label>
                                        <input
                                            type="number" id="diemTBLop10" name="diemTBLop10" value={diemTBLop10}
                                            onChange={(e) => setDiemTBLop10(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Ví dụ: 8.0" step="0.01" min="0" max="10"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="diemTBLop11" className="block text-sm font-medium text-gray-600 mb-1">
                                            Điểm TB cả năm lớp 11:
                                        </label>
                                        <input
                                            type="number" id="diemTBLop11" name="diemTBLop11" value={diemTBLop11}
                                            onChange={(e) => setDiemTBLop11(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Ví dụ: 8.2" step="0.01" min="0" max="10"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="diemTBLop12" className="block text-sm font-medium text-gray-600 mb-1">
                                            Điểm TB cả năm lớp 12:
                                        </label>
                                        <input
                                            type="number" id="diemTBLop12" name="diemTBLop12" value={diemTBLop12}
                                            onChange={(e) => setDiemTBLop12(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Ví dụ: 8.5" step="0.01" min="0" max="10"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Bước 3: Điểm khuyến khích, ưu tiên (nếu có) */}
                            <section>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                    Bước 3: Nhập điểm khuyến khích, ưu tiên (nếu có)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="diemKhuyenKhich" className="block text-sm font-medium text-gray-600 mb-1">
                                            Tổng điểm khuyến khích (cộng vào điểm thi):
                                        </label>
                                        <input
                                            type="number" id="diemKhuyenKhich" name="diemKhuyenKhich" value={diemKhuyenKhich}
                                            onChange={(e) => setDiemKhuyenKhich(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Ví dụ: 1.5 (Nếu không, nhập 0)" step="0.01" min="0"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Là tổng điểm khuyến khích được cộng vào điểm các bài thi theo quy chế (VD: điểm chứng chỉ nghề).</p>
                                    </div>
                                    <div>
                                        <label htmlFor="diemUuTien" className="block text-sm font-medium text-gray-600 mb-1">
                                            Điểm ưu tiên (KV, Đối tượng):
                                        </label>
                                        <input
                                            type="number" id="diemUuTien" name="diemUuTien" value={diemUuTien}
                                            onChange={(e) => setDiemUuTien(e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Ví dụ: 0.75 (Nếu không, nhập 0)" step="0.01" min="0" max="2.75"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Là điểm ưu tiên khu vực, đối tượng được cộng vào kết quả cuối cùng.</p>
                                    </div>
                                </div>
                            </section>

                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                            >
                                Xem kết quả điểm xét tốt nghiệp
                            </button>

                            {diemXetTotNghiep !== null && (
                                <div className="mt-10 p-6 bg-green-50 border-2 border-green-500 rounded-lg shadow-md text-center">
                                    <h3 className="text-xl font-semibold text-green-800 mb-3">Kết quả điểm xét tốt nghiệp THPT 2025 (Dự kiến):</h3>
                                    <p className="text-4xl font-bold text-green-700 mb-4">{diemXetTotNghiep.toFixed(2)}</p>
                                    {diemXetTotNghiep >= 5.0 && !errorMessages.some(e => e.includes("liệt")) && (
                                        <p className="text-lg font-medium text-green-600">Chúc mừng! Bạn có khả năng đủ điều kiện tốt nghiệp.</p>
                                    )}
                                    {diemXetTotNghiep < 5.0 && !errorMessages.some(e => e.includes("liệt")) && (
                                        <p className="text-lg font-medium text-red-600">Rất tiếc! Điểm của bạn có khả năng chưa đủ điều kiện tốt nghiệp (Yêu cầu &ge; 5.0 và không có môn nào bị điểm liệt).</p>
                                    )}
                                    {errorMessages.some(e => e.includes("liệt")) && (
                                        <p className="text-lg font-medium text-red-600">Có môn thi bị điểm liệt. Không đủ điều kiện xét tốt nghiệp.</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-4">
                                        Lưu ý: Kết quả này chỉ mang tính tham khảo.
                                        Vui lòng đối chiếu với quy chế tuyển sinh chính thức của Bộ Giáo dục và Đào tạo cho năm 2025.
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}