import { Share } from "@capacitor/share";
import { toast } from "sonner";

/**
 * Safely share the app URL and text across Web, Capacitor, and Desktop.
 */
class ShareService {
  private isCapacitor =
    typeof window !== "undefined" && (window as any).Capacitor?.isNative;

  async shareApp(title: string, text: string) {
    const shareData = {
      title,
      text,
      url: "https://myduolingo.vercel.app",
    };

    try {
      if (this.isCapacitor) {
        // Native Share Sheet (iOS/Android)
        await Share.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
          dialogTitle: "Convida os teus amigos",
        });
      } else if (typeof navigator !== "undefined" && navigator.share) {
        // Web Share API (Mobile Web / Some Desktop Browsers)
        await navigator.share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        // Fallback: Copy to Clipboard (Tauri Desktop / Old Browsers)
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        toast.success("Link copiado para a Área de Transferência! 📋");
      }
    } catch (e) {
      console.log("Share canceled or failed", e);
    }
  }
}

export const shareService = new ShareService();
