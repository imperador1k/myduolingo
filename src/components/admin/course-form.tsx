"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveCourseAction } from "@/actions/admin-courses";
import { Loader2, Upload, ImageIcon } from "lucide-react";

type CourseData = {
    id: number;
    title: string;
    imageSrc: string;
    languageCode: string;
    language: string;
};

type Props = {
    initialData?: CourseData;
};

export const CourseForm = ({ initialData }: Props) => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState(initialData?.title ?? "");
    const [language, setLanguage] = useState(initialData?.language ?? "");
    const [languageCode, setLanguageCode] = useState(initialData?.languageCode ?? "");
    const [preview, setPreview] = useState<string | null>(initialData?.imageSrc ?? null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditing = !!initialData;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            if (initialData?.id) formData.append("id", String(initialData.id));
            formData.append("title", title);
            formData.append("language", language);
            formData.append("languageCode", languageCode);
            if (selectedFile) formData.append("image", selectedFile);

            await saveCourseAction(formData);
            // redirect happens server-side
        } catch (err: any) {
            console.error(err);
            setError(err?.message || "Ocorreu um erro ao salvar o curso.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border-2 border-slate-100 overflow-hidden">
            <div className="p-8 flex flex-col gap-6">
                {/* Image Upload */}
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Imagem do Curso (Bandeira/Logo)
                    </label>
                    <div className="flex items-center gap-6">
                        {/* Preview */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-28 h-28 rounded-3xl border-4 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all group relative shrink-0"
                        >
                            {preview ? (
                                <Image
                                    src={preview}
                                    alt="Preview"
                                    fill
                                    className="object-contain p-2"
                                />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-sky-400 transition-colors" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-sm font-bold flex items-center gap-2 transition-colors w-fit md:w-auto"
                            >
                                <Upload className="w-5 h-5" />
                                {preview ? "Alterar Imagem" : "Carregar Imagem"}
                            </button>
                            <p className="text-[10px] text-slate-400 font-medium">SVG, PNG ou JPG. Máx. 2MB.</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Nome do Curso
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Ex: "Inglês para Falantes de Português"'
                        required
                        className="w-full px-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-base font-bold text-slate-700 outline-none focus:border-sky-400 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Language */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="language" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Idioma (Nome Completo)
                    </label>
                    <input
                        id="language"
                        type="text"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder='Ex: "English", "Japonês"'
                        required
                        className="w-full px-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-base font-bold text-slate-700 outline-none focus:border-sky-400 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Language Code */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="languageCode" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Código do Idioma (ISO 639-1)
                    </label>
                    <input
                        id="languageCode"
                        type="text"
                        value={languageCode}
                        onChange={(e) => setLanguageCode(e.target.value.toLowerCase())}
                        placeholder='Ex: "en", "ja", "fr"'
                        required
                        maxLength={5}
                        className="w-full max-w-[150px] px-5 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-base font-black text-slate-700 uppercase outline-none focus:border-sky-400 focus:bg-white transition-all placeholder:text-slate-400 placeholder:normal-case"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wide border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 disabled:active:border-b-4 disabled:active:translate-y-0"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            A GUARDAR...
                        </>
                    ) : (
                        isEditing ? "SALVAR ALTERAÇÕES" : "CRIAR CURSO"
                    )}
                </button>
            </div>
        </form>
    );
};
