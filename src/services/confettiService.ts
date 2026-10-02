import confetti from 'canvas-confetti';

/**
 * 24K VIP 황금 컨페티 파티클 분사
 */
export function fireGoldConfetti() {
  try {
    const count = 120;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#FFDF73', '#AA771C', '#F3E5AB', '#FFFBEB'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  } catch {
    // Graceful fallback if canvas-confetti fails
  }
}
