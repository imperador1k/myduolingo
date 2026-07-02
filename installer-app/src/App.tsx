import { useState } from "react";
import { Download, CheckCircle2, ChevronRight, AlertTriangle, Sparkles, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Topbar } from "./components/Topbar";

function App() {
  const [step, setStep] = useState<"welcome" | "features" | "install">("welcome");
  const [status, setStatus] = useState<"idle" | "downloading" | "installing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const startInstall = async () => {
    if (!acceptedTerms) return;
    setStatus("downloading");
    setErrorMessage("");
    try {
      await listen("download-progress", (event: any) => {
        setProgress(event.payload.progress);
        if (event.payload.progress >= 100) {
          setStatus("installing");
        }
      });
      await invoke("download_and_install_faro");
      setStatus("success");
    } catch (e: any) {
      console.error(e);
      setErrorMessage(String(e));
      setStatus("error");
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9000,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: [
      "radial-gradient(circle at 100% 0%, rgba(215,88,15,0.6) 0%, rgba(160,50,10,0.1) 40%, transparent 60%)",
      "radial-gradient(circle at 0% 100%, rgba(95,25,160,0.6) 0%, rgba(50,15,100,0.2) 40%, transparent 60%)",
      "radial-gradient(circle at 50% 50%, rgba(15,25,110,0.2) 0%, transparent 80%)",
      "#0a0c14",
    ].join(", "),
    backdropFilter: "blur(20px)",
  };

  const cardStyle: React.CSSProperties = {
    width: "640px",
    minHeight: "420px",
    background: "rgba(20, 24, 38, 0.65)",
    backdropFilter: "blur(40px)",
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "48px",
    boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(255,255,255,0.15)",
    display: "flex",
    flexDirection: "column",
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
    position: "relative",
    overflow: "hidden"
  };

  const buttonStyle = (hovered: boolean, destructive = false, disabled = false): React.CSSProperties => ({
    width: "100%",
    height: "56px",
    background: disabled 
      ? "rgba(255,255,255,0.05)"
      : destructive
        ? hovered ? "rgba(248, 113, 113, 0.2)" : "rgba(248, 113, 113, 0.1)"
        : hovered ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    border: destructive ? "1px solid rgba(248, 113, 113, 0.3)" : disabled ? "1px solid rgba(255,255,255,0.1)" : "none",
    borderRadius: "16px",
    color: disabled ? "rgba(255,255,255,0.3)" : "#fff",
    fontSize: "18px",
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: !destructive && hovered && !disabled ? "0 10px 30px rgba(16,185,129,0.4)" : "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "auto",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  });

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={overlayStyle} className="select-none overflow-hidden text-slate-100 relative">
      {/* Animated gamified background elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <Topbar />

      <div className="mb-10 text-center pointer-events-none mt-12 z-10">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 tracking-tight drop-shadow-xl">Faro</h1>
        <p className="text-white/70 mt-4 font-bold text-2xl tracking-wide uppercase">A tua nova jornada começa aqui</p>
      </div>

      <div style={cardStyle}>
        {step !== "welcome" && status === "idle" && (
          <button 
            onClick={() => setStep(step === "features" ? "welcome" : "features")}
            className="absolute top-6 left-6 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        
        {step === "welcome" && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 pt-4">
            <div className="flex items-center gap-6 mb-8">
              <img src="/faro-icon.png" alt="Faro" className="w-24 h-24 drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }} />
              <div>
                <h2 className="text-4xl font-black tracking-tight text-white mb-2">Preparado para jogar? 🎮</h2>
                <p className="text-white/60 text-lg font-medium">Aprender não tem de ser aborrecido.</p>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed mb-10 text-xl font-medium">
              Transformámos o estudo de idiomas numa autêntica aventura. Escolhe o teu caminho, sobe de nível, ganha recompensas e compete com os teus amigos!
            </p>
            <button
              onClick={() => setStep("features")}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={buttonStyle(isHovered)}
            >
              Começar Aventura
              <ArrowRight className="w-6 h-6 ml-2" />
            </button>
          </div>
        )}

        {step === "features" && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 pt-6">
            <div className="flex flex-col items-center gap-2 mb-10 text-center">
              <h2 className="text-4xl font-black tracking-tight">O teu Arsenal 🗡️</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white mb-1">10 Idiomas</span>
                  <span className="text-sm text-white/60 font-medium">Desbloqueia novos mundos de Espanhol a Japonês.</span>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white mb-1">Minijogos</span>
                  <span className="text-sm text-white/60 font-medium">Aprende enquanto te divertes no Arcade.</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep("install")}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={buttonStyle(isHovered)}
            >
              Continuar
              <ArrowRight className="w-6 h-6 ml-2" />
            </button>
          </div>
        )}

        {step === "install" && (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500 pt-6">
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "36px" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(16,185,129,0.4)",
                  flexShrink: 0,
                }}
              >
                <Download style={{ width: "36px", height: "36px", color: "#fff" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "28px", fontWeight: 900, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                  {status === "idle" && "Último Passo!"}
                  {status === "downloading" && "A equipar recursos..."}
                  {status === "installing" && "A forjar o Faro..."}
                  {status === "success" && "Missão Concluída! 🏆"}
                  {status === "error" && "Erro Crítico"}
                </h2>
                <p style={{ margin: 0, fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: "1.5", fontWeight: 500 }}>
                  {status === "idle" && "Aceita os termos abaixo para iniciarmos a forja."}
                  {status === "downloading" && "A descarregar os mapas e áudios épicos..."}
                  {status === "installing" && "A preparar a tua base de operações..."}
                  {status === "success" && "O Faro está instalado. Abre-o e começa a jogar!"}
                  {status === "error" && "Não foi possível concluir a missão."}
                </p>
              </div>
            </div>

            <div style={{ marginTop: "auto" }}>
              {status === "idle" && (
                <div className="flex flex-col gap-8">
                  <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                    <div className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${acceptedTerms ? "bg-emerald-500 border-emerald-500 scale-105" : "border-white/30 group-hover:border-white/50"}`}>
                      {acceptedTerms && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <span className="text-base text-white/80 font-medium leading-snug">
                      Eu juro solenemente que li e aceito os <a href="#" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-4">Termos de Uso</a> e a <a href="#" className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-4">Política de Privacidade</a> do Faro.
                    </span>
                  </label>

                  <button
                    onClick={startInstall}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={buttonStyle(isHovered, false, !acceptedTerms)}
                    disabled={!acceptedTerms}
                  >
                    <Download className="w-6 h-6" />
                    Iniciar Download
                  </button>
                </div>
              )}

              {(status === "downloading" || status === "installing") && (
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700 }}>
                    <span style={{ color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "1px" }}>
                      {status === "downloading" ? "Download" : "Instalação"}
                    </span>
                    <span style={{ color: "#10b981" }}>{progress}%</span>
                  </div>
                  <div style={{ height: "12px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #34d399 0%, #10b981 100%)",
                        borderRadius: "6px",
                        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "0 0 20px rgba(16,185,129,0.5)"
                      }}
                    />
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="w-full flex flex-col items-center justify-center py-6 gap-6">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce" style={{ animationIterationCount: 1 }}>
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <span className="text-emerald-400 font-bold text-xl uppercase tracking-widest">Missão Cumprida!</span>
                  <button
                    onClick={async () => {
                      try {
                        await invoke("launch_faro");
                        const { getCurrentWindow } = await import("@tauri-apps/api/window");
                        getCurrentWindow().close();
                      } catch(e: any) {
                        setErrorMessage(String(e));
                        setStatus("error");
                      }
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{...buttonStyle(isHovered, false, false), marginTop: "0"}}
                  >
                    <Zap className="w-6 h-6" />
                    Executar Jogo
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col gap-4">
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                    <p className="text-rose-400 text-sm font-medium">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => setStatus("idle")}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={buttonStyle(isHovered, true)}
                  >
                    <AlertTriangle className="w-6 h-6" />
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 text-center w-full text-sm text-white/30 font-bold tracking-[0.2em] pointer-events-none">
        © 2026 MYDUOLINGO STUDIOS. TODOS OS DIREITOS RESERVADOS.
      </div>
    </div>
  );
}

export default App;
