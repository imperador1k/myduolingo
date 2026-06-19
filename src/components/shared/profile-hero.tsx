"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { updateUserBanner } from "@/actions/user-progress";
import { useTransition } from "react";

type Props = {
  imageUrl: string | null;
  name: string;
  username: string;
  createdAt: Date;
  actions?: ReactNode;
  bannerColorFrom?: string;
  bannerColorTo?: string;
  isPro?: boolean;
  bannerImageUrl?: string | null;
  isOwner?: boolean;
};

export const ProfileHero = ({
  imageUrl,
  name,
  username,
  createdAt,
  actions,
  bannerColorFrom = "from-sky-400",
  bannerColorTo = "to-emerald-400",
  isPro = false,
  bannerImageUrl,
  isOwner = false,
}: Props) => {
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(filePath);

      startTransition(async () => {
        const result = await updateUserBanner(data.publicUrl);
        if (!result.success) {
          const errorMessage =
            "message" in result ? result.message : "Erro ao guardar o banner.";
          toast.error(errorMessage);
        } else {
          toast.success("Capa atualizada com sucesso!");
        }
        setUploading(false);
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar a imagem.");
      setUploading(false);
    } finally {
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="relative w-full mb-10 pt-20 group">
      {/* Banner Background - Custom Image or Gradient */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-40 rounded-[3rem] shadow-sm z-0 transition-all duration-700 bg-stone-100 border-2 border-stone-200 overflow-hidden flex items-center justify-center",
          !bannerImageUrl &&
            `after:absolute after:inset-0 after:bg-gradient-to-r after:opacity-60 after:rounded-[3rem] ${bannerColorFrom === "from-sky-400" ? "after:from-sky-100 after:to-emerald-100" : "after:from-indigo-100 after:to-purple-100"}`,
        )}
      >
        {bannerImageUrl ? (
          <Image
            src={bannerImageUrl}
            alt="Capa"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200 opacity-40" />
        )}

        {isOwner && (
          <div className="absolute top-4 right-4 z-20">
            <label className="cursor-pointer relative overflow-hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-600 shadow-md transition-all duration-300 backdrop-blur-sm border-2 border-stone-200 hover:scale-105 active:scale-95">
              {uploading || isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
                disabled={uploading || isPending}
              />
            </label>
          </div>
        )}
      </div>

      <div className="relative z-10 w-full bg-white rounded-[3rem] border-2 border-stone-200 border-b-8 p-8 pt-16 lg:pt-8 shadow-sm flex flex-col lg:flex-row items-center lg:items-center gap-6 lg:gap-10 mt-16 lg:mt-12 transition-all hover:shadow-md flex-wrap lg:flex-nowrap">
        {/* Avatar Bento Box breaking out */}
        <div className="absolute -top-20 flex left-1/2 max-lg:-translate-x-1/2 lg:left-12 lg:translate-x-0">
          <div className="relative flex h-32 w-32 lg:h-36 lg:w-36 shrink-0 items-center justify-center rounded-[2rem] lg:rounded-[2.5rem] bg-white text-5xl lg:text-6xl shadow-2xl ring-4 lg:ring-8 ring-white overflow-hidden border-2 border-stone-100 border-b-8 shadow-stone-200/50 group-hover:scale-105 transition-all duration-500 cursor-pointer">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Avatar"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-sky-50 text-sky-500 font-black">
                {name[0]?.toUpperCase() || "🧑‍🎓"}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:ml-[170px] w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left mt-0 min-w-0 px-2 lg:px-0">
          <div className="flex flex-col gap-1 w-full">
            <h1 className="text-3xl lg:text-4xl font-black text-stone-700 tracking-tight drop-shadow-sm uppercase break-words line-clamp-2 xl:line-clamp-none flex flex-col sm:flex-row items-center justify-center lg:justify-start">
              <span className="truncate">
                {name || username || "Estudante"}
              </span>
              {isPro && (
                <BadgeCheck
                  className="h-6 w-6 lg:h-8 lg:w-8 text-amber-500 fill-amber-300 sm:ml-2 mt-1 sm:mt-0 shrink-0 inline-block"
                  aria-hidden="true"
                />
              )}
            </h1>
            <p className="text-stone-400 font-bold text-lg tracking-tight truncate w-full">
              @{username?.toLowerCase().replace(" ", "") || "estudante"}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <div className="bg-stone-100 px-4 py-1.5 rounded-xl border-2 border-stone-200 border-b-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest leading-none truncate">
                Membro desde {new Date(createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Hub - Tactile and floating */}
        <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 shrink-0 w-full lg:w-auto flex-wrap">
          {actions}
        </div>
      </div>
    </div>
  );
};
