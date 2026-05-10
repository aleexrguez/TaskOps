type ConfettiOrigin = {
  x: number;
  y: number;
};

export function getConfettiOriginFromElement(
  element: Element | null,
): ConfettiOrigin | undefined {
  if (!element) return undefined;

  const rect = element.getBoundingClientRect();

  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  };
}

export async function celebrateTaskDone(
  origin?: ConfettiOrigin,
): Promise<void> {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;

  const { default: confetti } = await import('canvas-confetti');

  confetti({
    particleCount: 40,
    spread: 50,
    origin: origin ?? { y: 0.7 },
    decay: 0.92,
    ticks: 150,
    disableForReducedMotion: true,
  });
}
