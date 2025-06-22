// app/admin/documents/page.tsx

"use client";

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { subjectMap, typeMap, getDisplayValue } from './document-data';
import { UploadCloud, Trash2, FileText, Calendar, Tag, BookText } from 'lucide-react';
import Link from 'next/link';

// --- Interfaces ---
interface Document {
    id: number;
    title: string;
    description: string;
    year: number;
    subject: string;
    type: string;
    fileUrl: string;
    fileSize: string;
}

interface PageInfo {
    totalPages: number;
    number: number;
    last: boolean;
}

// --- Component Chính ---
const AdminDocumentsPage = () => {
    const { token } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    // State cho form upload
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [subject, setSubject] = useState('');
    const [type, setType] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fetchDocuments = useCallback(async (page: number) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/documents/public/all?page=${page}&size=10&sort=createdAt,desc`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Không thể tải danh sách tài liệu.");
            const result = await response.json();
            
            if (result.success && result.data?.content) {
                setDocuments(result.data.content);
                setPageInfo({
                    totalPages: result.data.totalPages,
                    number: result.data.number,
                    last: result.data.last,
                });
            } else {
                setDocuments([]);
                setPageInfo(null);
            }
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDocuments(currentPage);
    }, [currentPage, fetchDocuments]);

    const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !title || !subject || !type || !year) {
            toast.warn("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }
        setIsSubmitting(true);
        
        const formData = new FormData();
        formData.append('documentFile', file);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('year', String(year));
        formData.append('subject', subjectMap[subject]);
        formData.append('type', typeMap[type]);

        try {
            const response = await fetch("/api/v1/documents", {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Tải lên thất bại.");
            
            toast.success(result.message);
            // Reset form và tải lại danh sách
            e.currentTarget.reset();
            setFile(null);
            fetchDocuments(0);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = async (documentId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;
        
        try {
            const response = await fetch(`/api/v1/documents/${documentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                 const result = await response.json().catch(()=>null);
                 throw new Error(result?.message || "Xóa thất bại.");
            }
             toast.success("Xóa tài liệu thành công!");
             fetchDocuments(currentPage); // Tải lại trang hiện tại
        } catch (error) {
             toast.error((error as Error).message);
        }
    };


    return (
        <section className="pb-12 pt-28 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <ToastContainer />
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Quản lý Tài liệu Thi</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Thêm mới và quản lý các tài liệu ôn thi THPT Quốc Gia.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Tải lên */}
                    <div className="lg:col-span-1">
                        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-dark p-6 rounded-xl shadow-lg border dark:border-gray-700 sticky top-28">
                             <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                                <UploadCloud className="mr-3 text-primary"/> Tải lên tài liệu mới
                             </h3>
                             <div className="space-y-4">
                                <InputField label="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                <TextAreaField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <SelectField label="Môn học" value={subject} onChange={(e) => setSubject(e.target.value)} options={Object.keys(subjectMap)} required/>
                                    <InputField label="Năm" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
                                </div>
                                <SelectField label="Loại tài liệu" value={type} onChange={(e) => setType(e.target.value)} options={Object.keys(typeMap)} required />
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tệp tài liệu</label>
                                    <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                                </div>
                             </div>
                             <button type="submit" disabled={isSubmitting} className="w-full mt-6 flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-90 disabled:bg-gray-400">
                                 {isSubmitting ? 'Đang tải lên...' : 'Tải lên'}
                             </button>
                        </form>
                    </div>

                    {/* Danh sách tài liệu */}
                    <div className="lg:col-span-2">
                        {isLoading && documents.length === 0 ? <p>Đang tải danh sách...</p> : (
                            <div className="space-y-4">
                                {documents.length > 0 ? documents.map(doc => (
                                     <div key={doc.id} className="bg-white dark:bg-dark p-4 rounded-lg shadow-md border dark:border-gray-700 flex items-start space-x-4">
                                        <FileText className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 dark:text-white hover:text-primary transition-colors">{doc.title}</a>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center"><BookText size={14} className="mr-1"/>{getDisplayValue(subjectMap, doc.subject)}</span>
                                                <span className="flex items-center"><Calendar size={14} className="mr-1"/>{doc.year}</span>
                                                <span className="flex items-center"><Tag size={14} className="mr-1"/>{getDisplayValue(typeMap, doc.type)}</span>
                                                <span>{doc.fileSize}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(doc.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                            <Trash2 size={18} />
                                        </button>
                                     </div>
                                )) : <p className="text-center text-gray-500 py-10">Chưa có tài liệu nào.</p>}
                            </div>
                        )}
                        {/* Phân trang */}
                         {/* {pageInfo && pageInfo.totalPages > 1 && (
                             <Pagination pageInfo={pageInfo} onPageChange={setCurrentPage} />
                        )} */}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Component con ---
const InputField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><input {...props} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>);
const TextAreaField = ({ label, ...props }) => (<div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><textarea {...props} rows={3} className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"/></div>);
const SelectField = ({ label, options, ...props }) => (<div className="flex flex-col"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label><select {...props} className="w-full p-2.5 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600"><option value="">-- Chọn --</option>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>);
const Pagination = ({ pageInfo, onPageChange }) => { /* ... giữ nguyên từ các trang trước ... */ };

export default AdminDocumentsPage;

