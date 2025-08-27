
import { useCallback } from 'react';

/**
 * A custom hook to provide haptic feedback using the browser's Vibration API.
 * It offers several predefined patterns for common game events.
 */
const useVibration = () => {
  /**
   * Triggers a vibration pattern if the Vibration API is supported.
   * @param {VibratePattern} pattern - The vibration pattern (e.g., a single duration or an array of durations).
   */
  const vibrate = useCallback((pattern: VibratePattern) => {
    // Check for browser support and if the device has a vibration motor.
    if (window.navigator && 'vibrate' in window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        // This can happen if, for example, vibration is disabled in the browser's site settings.
        console.warn("Vibration failed. It might be disabled by the user.", e);
      }
    }
  }, []);

  // --- Predefined Vibration Patterns for Game Events ---

  /** Strong vibration for a crash event. */
  const playCrashVibration = useCallback(() => vibrate(400), [vibrate]);

  /** Short, sharp vibration for a warning (e.g., near-miss). */
  const playWarningVibration = useCallback(() => vibrate(100), [vibrate]);

  /** A satisfying series of pulses for a successful cash-out. */
  const playCashOutVibration = useCallback(() => vibrate([50, 50, 50]), [vibrate]);

  /** A standard confirmation buzz for placing a bet. */
  const playBetPlacedVibration = useCallback(() => vibrate(50), [vibrate]);

  /** A very short, subtle "tick" for quick UI interactions. */
  const playQuickBetVibration = useCallback(() => vibrate(20), [vibrate]);

  return {
    playCrashVibration,
    playWarningVibration,
    playCashOutVibration,
    playBetPlacedVibration,
    playQuickBetVibration,
  };
};

export default useVibration;
