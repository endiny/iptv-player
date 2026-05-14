import { useCallback, useEffect, useRef, useState } from 'react';

interface UseOverlayVisibilityResult {
  isOverlayVisible: boolean;
  showOverlay: () => void;
}

export function useOverlayVisibility(timeoutMs: number): UseOverlayVisibilityResult {
  const hideTimeout = useRef<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const scheduleHide = useCallback(() => {
    if (hideTimeout.current !== null) {
      window.clearTimeout(hideTimeout.current);
    }
    hideTimeout.current = window.setTimeout(() => {
      setIsOverlayVisible(false);
    }, timeoutMs);
  }, [timeoutMs]);

  const showOverlay = useCallback(() => {
    setIsOverlayVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    showOverlay();
    return () => {
      if (hideTimeout.current !== null) {
        window.clearTimeout(hideTimeout.current);
      }
    };
  }, [showOverlay]);

  return { isOverlayVisible, showOverlay };
}
