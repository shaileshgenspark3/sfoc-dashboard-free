import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger?: boolean;
}

const INDUSTRIAL_COLORS = ['#FF6B35', '#2ECC71', '#FFFFFF', '#4A4A4A'];

const Confetti = ({ trigger = false }: ConfettiProps) => {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      
      const duration = 2000;
      
      // Industrial burst
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: INDUSTRIAL_COLORS,
      });

      const interval = setInterval(() => {
        confetti({
          particleCount: 20,
          angle: 60,
          spread: 45,
          origin: { x: 0, y: 0.8 },
          colors: INDUSTRIAL_COLORS,
        });

        confetti({
          particleCount: 20,
          angle: 120,
          spread: 45,
          origin: { x: 1, y: 0.8 },
          colors: INDUSTRIAL_COLORS,
        });
      }, 250);

      setTimeout(() => {
        clearInterval(interval);
      }, duration);

      setTimeout(() => {
        hasTriggered.current = false;
      }, duration + 1000);
    }
  }, [trigger]);

  return null;
}

export const smallBurst = () => {
  confetti({
    particleCount: 40,
    spread: 40,
    origin: { y: 0.7 },
    colors: ['#FF6B35', '#2ECC71'],
  });
};

export const winnerCelebration = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const interval: any = setInterval(() => {
    const timeLeft = end - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 40 * (timeLeft / duration);
    
    confetti({
      particleCount,
      origin: { x: 0.2, y: 0.6 },
      colors: INDUSTRIAL_COLORS,
    });
    
    confetti({
      particleCount,
      origin: { x: 0.8, y: 0.6 },
      colors: INDUSTRIAL_COLORS,
    });
  }, 250);
};

export default Confetti;
