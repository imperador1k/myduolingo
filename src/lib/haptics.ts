import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Safely trigger haptics across Web, Capacitor, and Tauri.
 * Web browsers use navigator.vibrate if available.
 */
class HapticsService {
  private isCapacitor =
    typeof window !== "undefined" && (window as any).Capacitor?.isNative;

  /**
   * Triggered on correct answers or light successes
   */
  async light() {
    try {
      if (this.isCapacitor) {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Triggered on heavy actions or big impacts
   */
  async heavy() {
    try {
      if (this.isCapacitor) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Triggered on finishing a lesson or major success
   */
  async success() {
    try {
      if (this.isCapacitor) {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]); // Two quick pulses
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Triggered on wrong answers or errors
   */
  async error() {
    try {
      if (this.isCapacitor) {
        await Haptics.notification({ type: NotificationType.Error });
      } else if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]); // Long vibrations
      }
    } catch (e) {
      // Ignore
    }
  }
}

export const haptics = new HapticsService();
