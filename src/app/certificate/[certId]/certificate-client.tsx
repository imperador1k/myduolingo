"use client";

import { Button } from "@/components/ui/button";
import { Download, Share2, Check } from "lucide-react";
import { useState } from "react";

interface Props {
  certUrl: string;
}

export const CertificateClient = ({ certUrl }: Props) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(certUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        onClick={handlePrint}
        variant="sidebarOutline"
        className="text-stone-600 bg-white hover:bg-stone-100 font-bold border-2 border-stone-200 border-b-4 active:border-b-2 active:translate-y-[2px] transition-all rounded-xl px-6"
      >
        <Download className="w-4 h-4 mr-2" />
        Guardar PDF
      </Button>
      <Button
        onClick={handleShare}
        className="bg-sky-400 hover:bg-sky-500 text-white font-black uppercase tracking-widest border-2 border-sky-500 border-b-4 active:border-b-2 active:translate-y-[2px] hover:-translate-y-1 transition-all rounded-xl px-6 shadow-md shadow-sky-500/20"
      >
        {copied ? (
          <Check className="w-5 h-5 mr-2" />
        ) : (
          <Share2 className="w-5 h-5 mr-2" />
        )}
        {copied ? "Link Copiado" : "Partilhar Vitoria"}
      </Button>
    </>
  );
};
