"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { User, X, Camera, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const EditProfileButton = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPreviewImage(null);
    setSelectedFile(null);
    setIsOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      // Update Name
      if (firstName !== user.firstName || lastName !== user.lastName) {
        await user.update({
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
        });
      }

      // Update Avatar
      if (selectedFile) {
        await user.setProfileImage({ file: selectedFile });
      }

      toast.success("Perfil atualizado com sucesso!");
      setIsOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao atualizar o perfil", {
        description:
          error.errors?.[0]?.message ||
          "Verifica os teus dados e tenta novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-stone-100 text-stone-600 font-bold px-5 py-3 rounded-xl border-2 border-stone-200 border-b-4 hover:bg-stone-200 active:translate-y-1 active:border-b-0 transition-all uppercase tracking-wide"
      >
        Editar Perfil
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-modal max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
          <div className="relative bg-white border-2 border-stone-200 border-b-8 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-6 md:p-8">
            {/* Custom Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 h-10 w-10 flex items-center justify-center rounded-xl bg-white border-2 border-stone-200 border-b-4 hover:bg-stone-50 active:translate-y-1 active:border-b-0 transition-all z-50 group disabled:opacity-50"
              disabled={isSaving}
            >
              <X className="w-5 h-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-sky-100 p-3 rounded-2xl">
                <User className="w-6 h-6 text-[#1CB0F6]" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-stone-800 tracking-tight">
                  O teu Perfil
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => !isSaving && fileInputRef.current?.click()}
                >
                  <div className="relative h-28 w-28 rounded-[2rem] border-4 border-stone-200 overflow-hidden bg-stone-100 group-hover:border-[#1CB0F6] transition-colors shadow-sm">
                    <Image
                      src={previewImage || user?.imageUrl || ""}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                  Alterar Foto
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-4 text-base font-bold text-stone-700 outline-none focus:border-[#1CB0F6] focus:bg-white transition-all"
                    placeholder="O teu nome principal"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                    Apelido (Opcional)
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isSaving}
                    className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-4 text-base font-bold text-stone-700 outline-none focus:border-[#1CB0F6] focus:bg-white transition-all"
                    placeholder="Opcional"
                  />
                </div>

                <div className="space-y-2 opacity-60">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Email</span>
                    <span className="text-[#1CB0F6]">Principal</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.primaryEmailAddress?.emailAddress || ""}
                    className="w-full bg-stone-100 border-2 border-stone-200 rounded-2xl px-4 py-4 text-base font-bold text-stone-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !firstName.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#1CB0F6] text-white font-black uppercase tracking-wider py-4 rounded-2xl border-2 border-[#1899D6] border-b-6 hover:bg-[#1CB0F6]/90 active:translate-y-1 active:border-b-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSaving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Gravar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
