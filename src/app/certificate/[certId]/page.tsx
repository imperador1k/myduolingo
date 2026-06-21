import { getCertificateById } from "@/actions/certificates";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download, Share2, Rocket, Gamepad2, Globe } from "lucide-react";
import { CertificateClient } from "./certificate-client";

export const dynamic = "force-dynamic";

interface Props {
  params: {
    certId: string;
  };
}

export default async function CertificatePage({ params }: Props) {
  const certificate = await getCertificateById(params.certId);

  if (!certificate) {
    return notFound();
  }

  const formattedDate = new Intl.DateTimeFormat("pt-PT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(certificate.createdAt));

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center pb-20 px-4 sm:px-6 relative overflow-hidden print:bg-white print:py-0 print:px-0 font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @media print {
                    @page { size: A4 landscape; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `,
        }}
      />

      {/* Premium Deep Background for web */}
      <div
        className="absolute top-[-10%] left-[-20%] w-[70%] h-[70%] bg-sky-200/50 blur-[150px] rounded-full mix-blend-multiply pointer-events-none print:hidden animate-pulse"
        style={{ animationDuration: "8s" }}
      ></div>
      <div
        className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-emerald-200/50 blur-[150px] rounded-full mix-blend-multiply pointer-events-none print:hidden animate-pulse"
        style={{ animationDuration: "10s" }}
      ></div>
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-200/30 blur-[120px] rounded-full pointer-events-none print:hidden"></div>

      {/* Header Navbar */}
      <header className="w-full max-w-[1000px] mt-6 mb-12 flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden z-20 relative animate-in slide-in-from-top-8 fade-in duration-1000">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 relative group-hover:scale-110 transition-transform">
            <Image
              src="/mascot.svg"
              alt="Mascot"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-black text-stone-700 tracking-widest uppercase drop-shadow-sm">
            MyDuolingo
          </span>
        </Link>

        <div className="flex flex-wrap justify-center gap-4">
          <CertificateClient
            certUrl={`https://myduolingo.vercel.app/certificate/${params.certId}`}
          />
        </div>
      </header>

      {/* The Certificate Frame */}
      <div className="relative w-full max-w-[800px] min-h-[500px] h-auto bg-white shadow-2xl rounded-sm p-6 sm:p-8 md:p-10 flex flex-col items-center justify-between text-center print:shadow-none print:w-[297mm] print:h-[210mm] print:max-w-none print:p-12 z-10 mx-auto animate-in zoom-in-95 fade-in duration-1000 border border-stone-200 print:border-0">
        {/* Ornate Border */}
        <div className="absolute inset-4 sm:inset-6 md:inset-8 border-[12px] border-double border-amber-200 opacity-80 pointer-events-none"></div>
        <div className="absolute inset-[20px] sm:inset-[28px] md:inset-[36px] border-2 border-amber-100 pointer-events-none"></div>

        {/* Header */}
        <div className="mt-4 sm:mt-6 w-full flex flex-col items-center gap-2 sm:gap-4 relative z-10">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 relative drop-shadow-md animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <Image
              src="/mascot.svg"
              alt="MyDuolingo Mascot"
              fill
              className="object-contain"
            />
          </div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-800 uppercase tracking-[0.2em] mt-2 sm:mt-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Certificado de Excelência
          </h1>
          <div className="w-48 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent my-2"></div>
          <p className="text-stone-500 font-medium uppercase tracking-[0.3em] text-sm sm:text-base">
            MyDuolingo Academy
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-4 sm:my-6 px-2 sm:px-12 w-full">
          <p
            className="text-stone-500 italic text-sm sm:text-base md:text-lg mb-2 sm:mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Confere-se este diploma a
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-amber-500 mb-2 sm:mb-4 drop-shadow-sm tracking-tight capitalize break-words w-full leading-none"
            style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}
          >
            {certificate.userName}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm md:text-base max-w-lg leading-relaxed px-4">
            Por ter concluído com distinção e absoluto mérito a totalidade do
            curso de{" "}
            <strong className="text-stone-800 font-black">
              {certificate.course.title}
            </strong>
            , demonstrando proficiência, dedicação e mestria.
          </p>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-end px-4 sm:px-12 mb-4 sm:mb-6 relative z-10">
          <div className="flex flex-col items-center">
            <span className="text-stone-800 font-bold text-lg mb-2">
              {formattedDate}
            </span>
            <div className="w-32 h-[2px] bg-stone-300"></div>
            <span className="text-stone-400 uppercase tracking-widest text-[10px] sm:text-xs mt-2">
              Data de Emissão
            </span>
          </div>

          <div className="flex flex-col items-center relative">
            <div className="absolute -top-16 opacity-30 w-24 h-24 pointer-events-none">
              <Image
                src="/mascot.svg"
                alt="Seal"
                fill
                className="object-contain grayscale"
              />
            </div>
            <span
              className="text-stone-800 font-black text-xl italic mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              MyDuolingo
            </span>
            <div className="w-32 h-[2px] bg-stone-300"></div>
            <span className="text-stone-400 uppercase tracking-widest text-[10px] sm:text-xs mt-2">
              Administração
            </span>
          </div>
        </div>

        {/* Serial Number & Watermark */}
        <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
          <span className="text-stone-300 text-[10px] font-mono tracking-widest">
            ID: {certificate.id}
          </span>
        </div>
      </div>

      {/* Premium Marketing Footer (Hidden on print) */}
      <div className="mt-20 text-center print:hidden flex flex-col items-center w-full max-w-[1000px] z-10 relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent mb-12"></div>

        <h2 className="text-3xl md:text-5xl font-black text-stone-800 tracking-tight mb-4 drop-shadow-sm">
          Tu também podes dominar o{" "}
          <span className="text-sky-500">{certificate.course.title}</span>.
        </h2>
        <p className="text-stone-500 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
          Junta-te ao{" "}
          <strong className="text-stone-800">{certificate.userName}</strong> e a
          outros estudantes numa jornada épica de aprendizagem. É 100% gratuito,
          divertido e viciante!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-[6px] shadow-sm">
            <div className="w-14 h-14 bg-sky-100 text-sky-500 rounded-2xl flex items-center justify-center mb-4">
              <Rocket className="w-7 h-7" />
            </div>
            <h3 className="text-stone-800 font-black text-lg uppercase tracking-wider mb-2">
              Rápido & Eficaz
            </h3>
            <p className="text-stone-500 text-sm">
              Lições curtas de 5 minutos que se adaptam perfeitamente à tua
              rotina diária.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-[6px] shadow-sm">
            <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <h3 className="text-stone-800 font-black text-lg uppercase tracking-wider mb-2">
              Gamificado
            </h3>
            <p className="text-stone-500 text-sm">
              Ganha XP, completa missões diárias e desbloqueia personagens
              incríveis.
            </p>
          </div>
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl border-2 border-stone-200 border-b-[6px] shadow-sm">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-stone-800 font-black text-lg uppercase tracking-wider mb-2">
              Comunidade
            </h3>
            <p className="text-stone-500 text-sm">
              Adiciona amigos, entra em ligas globais e celebra as tuas vitórias
              com o mundo.
            </p>
          </div>
        </div>

        <Link href="/learn">
          <Button
            size="lg"
            className="bg-[#58cc02] hover:bg-[#46a302] text-white border-b-[6px] border-[#46a302] active:border-b-0 hover:-translate-y-1 active:translate-y-2 transition-all uppercase font-black tracking-widest rounded-3xl px-12 py-8 text-xl sm:text-2xl shadow-[0_0_40px_rgba(88,204,2,0.3)]"
          >
            Começar Agora
          </Button>
        </Link>
      </div>
    </div>
  );
}
