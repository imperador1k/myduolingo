import { useState } from "react";
import type { CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";

type InstallState = "idle" | "installing" | "done" | "error";
type Lang = "en" | "pt";

interface ProgressPayload {
  percentage: number;
  message_key: string;
}

const TRANSLATIONS = {
  en: {
    setup: "MyDuolingo Setup",
    tagline: "The one entry point for managing your learning experience, lessons, and progress.",
    install: "Install Now",
    installing: "Initializing...",
    complete: "Ready to Start!",
    launch: "Launch MyDuolingo",
    retry: "Try Again",
    failed: "Installation Failed",
    error_desc: "We couldn't connect to the server. Please check your internet connection and try again.",
    agreed: "I agree to the",
    terms: "Terms of Use",
    and: "and",
    privacy: "Privacy Policy",
    author: "Miguel Santos",
    extracting: "Downloading files...",
    checking: "Checking dependencies...",
    shortcuts: "Creating shortcuts...",
    registering: "Registering components...",
    finishing: "Finishing installation...",
  },
  pt: {
    setup: "Instalação MyDuolingo",
    tagline: "O ponto de entrada único para gerir a sua experiência de aprendizagem, lições e progresso.",
    install: "Instalar Agora",
    installing: "A inicializar...",
    complete: "Pronto a Começar!",
    launch: "Abrir MyDuolingo",
    retry: "Tentar Novamente",
    failed: "A Instalação Falhou",
    error_desc: "Não foi possível ligar ao servidor. Verifique a sua ligação à internet e tente novamente.",
    agreed: "Eu aceito os",
    terms: "Termos de Uso",
    and: "e a",
    privacy: "Política de Privacidade",
    author: "Miguel Santos",
    extracting: "A baixar ficheiros...",
    checking: "A verificar dependências...",
    shortcuts: "A criar atalhos...",
    registering: "A registar componentes...",
    finishing: "A finalizar instalação...",
  }
};

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [state, setState] = useState<InstallState>("idle");
  const [progress, setProgress] = useState(0);
  const [statusKey, setStatusKey] = useState("");
  const [agreed, setAgreed] = useState(false);
  
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverLaunch, setHoverLaunch] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);
  const [hoverMin, setHoverMin] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    invoke("minimize_window");
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    invoke("close_window");
  };

  const handleOpenLink = async (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    await open(url);
  };

  const handleInstall = async () => {
    if (!agreed) return;
    setState("installing");
    setProgress(0);
    setStatusKey("");

    const unlisten = await listen<ProgressPayload>("install-progress", (e) => {
      setProgress(e.payload.percentage);
      setStatusKey(e.payload.message_key);
    });

    try {
      await invoke("install_app");
      setState("done");
    } catch (err) {
      console.error("Install error:", err);
      setState("error");
    } finally {
      unlisten();
    }
  };

  // ─── Styles ──────────────────────────────────────────────────────────────

  const windowStyle: CSSProperties = {
    width: "100%", height: "100%",
    display: "flex", flexDirection: "column",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    background: [
      "radial-gradient(ellipse 460px 380px at 108% -10%, rgba(215,88,15,1.0) 0%, rgba(160,50,10,0.45) 45%, transparent 70%)",
      "radial-gradient(ellipse 350px 300px at 65% 25%,  rgba(95,25,160,0.65) 0%, transparent 65%)",
      "radial-gradient(ellipse 300px 380px at -5% 95%,  rgba(15,25,110,0.55)  0%, transparent 75%)",
      "#121524",
    ].join(", "),
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
  };

  const cardStyle: CSSProperties = {
    flex: 1,
    margin: "0 12px 12px 12px",
    background: state === "error" ? "rgba(40, 20, 20, 0.7)" : "rgba(20, 24, 38, 0.72)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "10px",
    border: "1px solid " + (state === "error" ? "rgba(248, 113, 113, 0.2)" : "rgba(255,255,255,0.08)"),
    display: "flex", flexDirection: "column",
    padding: "40px",
    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
    position: "relative",
    transition: "all 0.4s ease",
  };

  const primaryBtn = (hovered: boolean, disabled: boolean, isError = false): CSSProperties => ({
    width: "200px", height: "52px",
    background: disabled ? "rgba(255,255,255,0.05)" : isError ? "rgba(255,255,255,0.1)" : hovered ? "linear-gradient(135deg, #3291ff 0%, #0070f3 100%)" : "linear-gradient(135deg, #1b7bff 0%, #0c68db 100%)",
    border: isError ? "1px solid rgba(255,255,255,0.2)" : "none", 
    borderRadius: "10px",
    color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
    fontSize: "16px", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "default",
    letterSpacing: "0.02em",
    boxShadow: disabled || isError ? "none" : hovered ? "0 10px 30px rgba(0,112,243,0.4)" : "0 4px 14px rgba(0,0,0,0.2)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    borderTop: disabled || isError ? "none" : "1px solid rgba(255,255,255,0.25)",
  });

  return (
    <div style={{ width: "100%", height: "100%", background: "transparent" }}>
      <div style={windowStyle}>
        
        {/* Title Bar */}
        <div style={{ display: "flex", alignItems: "center", height: "38px", background: "rgba(0,0,0,0.15)" }}>
          <div data-tauri-drag-region style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", paddingLeft: "16px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500, pointerEvents: "none" }}>{t.setup}</span>
          </div>
          <button style={ctrlBtn(hoverMin, false)} onMouseEnter={() => setHoverMin(true)} onMouseLeave={() => setHoverMin(false)} onClick={handleMinimize}><svg width="11" height="1.5"><line x1="0" y1="0.75" x2="11" y2="0.75" stroke="currentColor" strokeWidth="1.5" /></svg></button>
          <button style={ctrlBtn(hoverClose, true)} onMouseEnter={() => setHoverClose(true)} onMouseLeave={() => setHoverClose(false)} onClick={handleClose}><svg width="10" height="10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg></button>
        </div>

        {/* The Card */}
        <div style={cardStyle}>
          
          <div style={{ position: "absolute", top: "40px", right: "40px", display: "flex", background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: "8px" }}>
            {(["en", "pt"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={langPillStyle(lang === l)}>{l}</button>
            ))}
          </div>

          {/* Logo Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "36px" }}>
            <img src="/icon.png" alt="Logo" width={68} height={68} style={{ borderRadius: "16px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>{t.author}</span>
              <span style={{ fontSize: "34px", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em" }}>MyDuolingo</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {state === "error" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#f87171" }}>{t.failed}</span>
                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: "340px" }}>{t.error_desc}</p>
              </div>
            ) : (
              <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, maxWidth: "340px" }}>{t.tagline}</p>
            )}
          </div>

          {/* Bottom Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {state === "idle" && (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <input type="checkbox" id="agreed" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ width: "18px", height: "18px", accentColor: "#1b7bff" }} />
                  <label htmlFor="agreed" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
                    {t.agreed} <a href="#" onClick={(e) => handleOpenLink(e, "https://google.com")} style={{ color: "#3291ff", textDecoration: "none", fontWeight: 600 }}>{t.terms}</a> {t.and} <a href="#" onClick={(e) => handleOpenLink(e, "https://google.com")} style={{ color: "#3291ff", textDecoration: "none", fontWeight: 600 }}>{t.privacy}</a>.
                  </label>
                </div>
                <button style={primaryBtn(hoverBtn, !agreed)} onMouseEnter={() => setHoverBtn(true)} onMouseLeave={() => setHoverBtn(false)} onClick={handleInstall} disabled={!agreed}>{t.install}</button>
              </>
            )}

            {state === "installing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", color: "#fff", fontWeight: 600 }}>{(t as any)[statusKey] || t.installing}</span>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #7c3aed, #3b82f6)", transition: "width 0.4s ease-out", boxShadow: "0 0 20px rgba(59,130,246,0.5)" }} />
                </div>
              </div>
            )}

            {state === "error" && (
              <button style={primaryBtn(hoverBtn, false, true)} onMouseEnter={() => setHoverBtn(true)} onMouseLeave={() => setHoverBtn(false)} onClick={handleInstall}>{t.retry}</button>
            )}

            {state === "done" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#4ade80" }}>
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <span style={{ fontSize: "16px", fontWeight: 700 }}>{t.complete}</span>
                </div>
                <button style={primaryBtn(hoverLaunch, false)} onMouseEnter={() => setHoverLaunch(true)} onMouseLeave={() => setHoverLaunch(false)} onClick={() => invoke("launch_app")}>{t.launch}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper styles (extracted for brevity)
function ctrlBtn(h: boolean, c: boolean): CSSProperties { return { width: "48px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: h ? (c ? "rgba(232,17,35,0.95)" : "rgba(255,255,255,0.12)") : "transparent", color: h ? "#fff" : "rgba(255,255,255,0.85)", transition: "all 0.2s", cursor: "default" }; }
function langPillStyle(a: boolean): CSSProperties { return { background: a ? "rgba(255,255,255,0.15)" : "transparent", border: "1px solid " + (a ? "rgba(255,255,255,0.2)" : "transparent"), padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: a ? "#fff" : "rgba(255,255,255,0.3)", textTransform: "uppercase", cursor: "default" }; }
