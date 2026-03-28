"use client";

import { useState, useMemo } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

type Props = {
    onUploadComplete: (url: string, type: "image" | "file", fileName: string) => void;
};

export const UploadButton = ({ onUploadComplete }: Props) => {
    const [uploading, setUploading] = useState(false);
    const { getToken } = useAuth();

    // Dynamically create the Supabase client to inject the Clerk JWT securely
    const supabase = useMemo(() => {
        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    fetch: async (url, options = {}) => {
                        const clerkToken = await getToken({ template: 'supabase' });
                        const headers = new Headers(options?.headers);
                        if (clerkToken) {
                            headers.set('Authorization', `Bearer ${clerkToken}`);
                        }
                        return fetch(url, { ...options, headers });
                    },
                },
            }
        );
    }, [getToken]);

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
                    className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-[14px] h-10 w-10 sm:h-[52px] sm:w-[52px] flex items-center justify-center transition-all border-2 border-slate-200 border-b-4 hover:border-b-4 active:border-b-0 active:translate-y-1 shrink-0 cursor-pointer"
                >
                    {uploading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-slate-500" /> : <Paperclip className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500" />}
                </div>
            </label>
        </div>
    );
};
