import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onPlayPause: () => void;
  onPrevChannel: () => void;
  onNextChannel: () => void;
  onFullScreen: () => void;
  onToggleMute: () => void;
  onNavigateHome: () => void;
  onShowOverlay: () => void;
}

export function useKeyboardShortcuts({
  onPlayPause,
  onPrevChannel,
  onNextChannel,
  onFullScreen,
  onToggleMute,
  onNavigateHome,
  onShowOverlay,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          onPlayPause();
          onShowOverlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevChannel();
          onShowOverlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextChannel();
          onShowOverlay();
          break;
        case 'f':
        case 'F':
          onFullScreen();
          break;
        case 'm':
        case 'M':
          onToggleMute();
          break;
        case 'Escape':
          onNavigateHome();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onPlayPause,
    onPrevChannel,
    onNextChannel,
    onFullScreen,
    onToggleMute,
    onNavigateHome,
    onShowOverlay,
  ]);
}
