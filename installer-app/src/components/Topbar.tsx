import { X, Minus, Square } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function Topbar() {
  const appWindow = getCurrentWindow();

  return (
    <div className="absolute top-0 left-0 w-full h-12 flex items-center justify-between px-4 z-[9999]">
      {/* Background drag region */}
      <div data-tauri-drag-region className="absolute inset-0" />
      
      <div className="relative flex items-center gap-2 pointer-events-none">
        <img src="/faro-icon.png" alt="Faro Logo" className="w-5 h-5 opacity-80" />
        <span className="text-xs font-bold text-white/50 tracking-widest">
          FARO INSTALLER
        </span>
      </div>

      <div className="relative flex items-center gap-2 z-10">
        <button
          onClick={() => appWindow.minimize()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <Minus className="w-4 h-4 pointer-events-none" />
        </button>
        <button
          onClick={() => appWindow.toggleMaximize()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <Square className="w-3.5 h-3.5 pointer-events-none" />
        </button>
        <button
          onClick={() => appWindow.close()}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-500/20 text-white/50 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 pointer-events-none" />
        </button>
      </div>
    </div>
  );
}
