import { useCallback, useEffect, useRef } from 'react';

export interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
}

export function useFocusTrap({
  isOpen,
  onClose,
  initialFocusRef,
  closeOnEscape = true,
}: UseFocusTrapOptions): React.RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyOpen = useRef(false);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      previouslyOpen.current = false;
      return;
    }

    if (!previouslyOpen.current) {
      if (initialFocusRef) {
        initialFocusRef.current?.focus();
      } else {
        const firstInput =
          containerRef.current?.querySelector<HTMLElement>('input');
        const focusable = getFocusableElements();
        (firstInput ?? focusable[0])?.focus();
      }
      previouslyOpen.current = true;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        if (closeOnEscape && onClose) onClose();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, initialFocusRef, closeOnEscape, getFocusableElements]);

  return containerRef;
}
