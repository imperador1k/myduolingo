"use client";

import { useState, useMemo } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/nextjs";

type Props = {
    onUploadComplete: (url: string, type: "image" | "file", fileName: string) => void;
};

export const UploadButton = ({ onUploadComplete }: Props) => {
    const [uploading, setUploading] = useState(false);
    const { getToken } = useAuth();

    const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        setUploading(true);

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            const type = file.type.startsWith('image/') ? 'image' : 'file';

            onUploadComplete(data.publicUrl, type, file.name);

        } catch (error) {
            console.error(error);
            alert("Erro ao enviar ficheiro.");
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={onFileSelect}
                disabled={uploading}
            />
            <label htmlFor="file-upload">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-stone-50 active:scale-95 shrink-0 cursor-pointer text-stone-400 hover:text-[#1CB0F6]"
                >
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-6 w-6" />}
                </div>
            </label>
        </div>
    );
};
