
import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * A custom hook to provide haptic feedback.
 * - On native platforms (iOS/Android), it uses the Capacitor Haptics plugin for rich feedback.
 * - On the web, it falls back to the browser's Vibration API.
 */
const useVibration = () => {
  const isNative = Capacitor.isNativePlatform();

  const playCrashVibration = useCallback(() => {
    if (isNative) {
      Haptics.notification({ type: NotificationType.Failure });
    } else if (navigator.vibrate) {
      navigator.vibrate(400);
    }
  }, [isNative]);

  const playWarningVibration = useCallback(() => {
    if (isNative) {
      Haptics.impact({ style: ImpactStyle.Medium });
    } else if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [isNative]);

  const playCashOutVibration = useCallback(() => {
    if (isNative) {
      Haptics.notification({ type: NotificationType.Success });
    } else if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [isNative]);

  const playBetPlacedVibration = useCallback(() => {
    if (isNative) {
      Haptics.impact({ style: ImpactStyle.Medium });
    } else if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [isNative]);

  const playQuickBetVibration = useCallback(() => {
    if (isNative) {
      Haptics.impact({ style: ImpactStyle.Light });
    } else if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  }, [isNative]);

  return {
    playCrashVibration,
    playWarningVibration,
    playCashOutVibration,
    playBetPlacedVibration,
    playQuickBetVibration,
  };
};

export default useVibration;
