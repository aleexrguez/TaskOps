interface ParticleConfig {
  top: string;
  left: string;
  size: number;
  duration: number;
  fadeDuration: number;
  delay: number;
}

const PARTICLES: ParticleConfig[] = [
  // Row 1: 0-10%
  { top: '2%', left: '8%', size: 5, duration: 14, fadeDuration: 9, delay: 0 },
  { top: '5%', left: '52%', size: 7, duration: 18, fadeDuration: 11, delay: 4 },
  { top: '8%', left: '88%', size: 4, duration: 12, fadeDuration: 8, delay: 7 },
  // Row 2: 10-25%
  {
    top: '13%',
    left: '28%',
    size: 9,
    duration: 22,
    fadeDuration: 13,
    delay: 2,
  },
  { top: '16%', left: '72%', size: 5, duration: 15, fadeDuration: 9, delay: 6 },
  {
    top: '20%',
    left: '5%',
    size: 6,
    duration: 19,
    fadeDuration: 11,
    delay: 10,
  },
  {
    top: '23%',
    left: '42%',
    size: 8,
    duration: 16,
    fadeDuration: 10,
    delay: 1,
  },
  // Row 3: 25-40%
  { top: '28%', left: '65%', size: 5, duration: 13, fadeDuration: 8, delay: 5 },
  {
    top: '30%',
    left: '15%',
    size: 10,
    duration: 24,
    fadeDuration: 14,
    delay: 3,
  },
  {
    top: '33%',
    left: '92%',
    size: 6,
    duration: 17,
    fadeDuration: 10,
    delay: 8,
  },
  { top: '37%', left: '48%', size: 4, duration: 11, fadeDuration: 7, delay: 0 },
  // Row 4: 40-55%
  {
    top: '42%',
    left: '22%',
    size: 7,
    duration: 20,
    fadeDuration: 12,
    delay: 4,
  },
  {
    top: '45%',
    left: '78%',
    size: 11,
    duration: 26,
    fadeDuration: 15,
    delay: 9,
  },
  { top: '48%', left: '55%', size: 5, duration: 14, fadeDuration: 9, delay: 2 },
  { top: '52%', left: '3%', size: 6, duration: 18, fadeDuration: 11, delay: 6 },
  {
    top: '54%',
    left: '38%',
    size: 8,
    duration: 15,
    fadeDuration: 10,
    delay: 11,
  },
  // Row 5: 55-70%
  { top: '58%', left: '85%', size: 5, duration: 12, fadeDuration: 8, delay: 1 },
  {
    top: '60%',
    left: '60%',
    size: 7,
    duration: 21,
    fadeDuration: 12,
    delay: 5,
  },
  { top: '63%', left: '18%', size: 4, duration: 10, fadeDuration: 7, delay: 8 },
  {
    top: '66%',
    left: '45%',
    size: 9,
    duration: 23,
    fadeDuration: 13,
    delay: 3,
  },
  {
    top: '69%',
    left: '75%',
    size: 6,
    duration: 16,
    fadeDuration: 10,
    delay: 7,
  },
  // Row 6: 70-85%
  { top: '72%', left: '10%', size: 5, duration: 13, fadeDuration: 8, delay: 0 },
  {
    top: '75%',
    left: '55%',
    size: 10,
    duration: 25,
    fadeDuration: 14,
    delay: 4,
  },
  {
    top: '78%',
    left: '32%',
    size: 6,
    duration: 17,
    fadeDuration: 10,
    delay: 9,
  },
  { top: '80%', left: '90%', size: 4, duration: 11, fadeDuration: 7, delay: 2 },
  // Row 7: 85-100%
  {
    top: '85%',
    left: '68%',
    size: 7,
    duration: 19,
    fadeDuration: 11,
    delay: 6,
  },
  {
    top: '88%',
    left: '25%',
    size: 8,
    duration: 22,
    fadeDuration: 13,
    delay: 1,
  },
  { top: '92%', left: '50%', size: 5, duration: 14, fadeDuration: 9, delay: 5 },
  {
    top: '95%',
    left: '82%',
    size: 6,
    duration: 16,
    fadeDuration: 10,
    delay: 10,
  },
  { top: '97%', left: '12%', size: 4, duration: 12, fadeDuration: 8, delay: 3 },
];

export function ParticleBackground() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
      data-testid="particle-background"
    >
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="particle-bg-dot"
          style={
            {
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              '--particle-duration': `${p.duration}s`,
              '--particle-fade-duration': `${p.fadeDuration}s`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
