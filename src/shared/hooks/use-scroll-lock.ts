import { useEffect } from 'react';

let lockCount = 0;
let savedStyles: {
  overflow: string;
  position: string;
  top: string;
  width: string;
  paddingRight: string;
} | null = null;
let savedScrollY = 0;

function lock(): void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    savedStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      paddingRight: document.body.style.paddingRight,
    };

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

function unlock(): void {
  lockCount--;
  if (lockCount === 0 && savedStyles) {
    document.body.style.overflow = savedStyles.overflow;
    document.body.style.position = savedStyles.position;
    document.body.style.top = savedStyles.top;
    document.body.style.width = savedStyles.width;
    document.body.style.paddingRight = savedStyles.paddingRight;
    savedStyles = null;

    window.scrollTo(0, savedScrollY);
  }
}

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    lock();
    return () => unlock();
  }, [isLocked]);
}

export function _resetForTesting(): void {
  lockCount = 0;
  savedStyles = null;
  savedScrollY = 0;
}
