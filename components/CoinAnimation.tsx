import React, { useState, useEffect } from 'react';
import type { CoinAnimationData } from '../types';

const NUM_COINS = 15;
const ANIMATION_DURATION = 1000; // ms

interface CoinParticleProps {
  id: number;
  type: 'win' | 'loss' | 'bet';
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  onComplete: (id: number) => void;
}

const CoinParticle: React.FC<CoinParticleProps> = ({ id, type, startX, startY, endX, endY, onComplete }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    left: startX,
    top: startY,
    opacity: 0,
    transform: 'scale(0.5)',
  });
  
  useEffect(() => {
    // Staggered fade-in
    const startTimeout = setTimeout(() => {
      let targetX: number, targetY: number;
      const spread = 80;

      if (type === 'loss') {
        // Fall downwards
        targetX = startX + (Math.random() - 0.5) * spread * 2;
        targetY = startY + 100 + Math.random() * spread;
      } else {
        // Move towards the target (endX, endY are guaranteed to exist for win/bet)
        targetX = endX! + (Math.random() - 0.5) * 30;
        targetY = endY! + (Math.random() - 0.5) * 20;
      }
      
      const angle = Math.atan2(targetY - startY, targetX - startX);
      const distance = Math.hypot(targetX - startX, targetY - startY);
      const arcHeight = type === 'loss' ? -30 : 30;

      const controlX = startX + (distance / 2) * Math.cos(angle) - arcHeight * Math.sin(angle);
      const controlY = startY + (distance / 2) * Math.sin(angle) + arcHeight * Math.cos(angle);
      
      setStyle({
        ...style,
        opacity: 1,
        transform: `scale(1) translateX(0) translateY(0)`,
        transition: `opacity 0.2s ease-out, transform 0.2s ease-out`,
      });

      // Animate to destination
      setTimeout(() => {
        setStyle({
            left: targetX,
            top: targetY,
            opacity: 0,
            transform: 'scale(0.3)',
            transition: `all ${ANIMATION_DURATION * 0.8}ms cubic-bezier(0.3, 0.2, 0.9, 0.8)`,
        });
      }, 50);

    }, 0);

    const endTimeout = setTimeout(() => {
      onComplete(id);
    }, ANIMATION_DURATION);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(endTimeout);
    };
  }, []); // Run only once

  return (
    <div
      style={style}
      className="fixed w-3 h-3 rounded-full z-[9999] pointer-events-none bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_6px_1px_rgba(251,191,36,0.7)]"
    />
  );
};

interface CoinAnimationManagerProps {
  animations: CoinAnimationData[];
}

const CoinAnimationManager: React.FC<CoinAnimationManagerProps> = ({ animations }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (animations.length > 0) {
      const latestAnimation = animations[animations.length - 1];
      const newParticles = Array.from({ length: NUM_COINS }).map((_, i) => ({
        ...latestAnimation,
        id: latestAnimation.id + i,
        delay: i * (Math.random() * 20 + 10), // Add delay for staggered effect
      }));
      
      // Use a function with timeout to add particles with delay
      newParticles.forEach(p => {
        setTimeout(() => {
           setParticles(current => [...current, p]);
        }, p.delay);
      });
    }
  }, [animations]);

  const handleParticleComplete = (id: number) => {
    setParticles(current => current.filter(p => p.id !== id));
  };
  
  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-[9998]">
      {particles.map((particle) => (
        <CoinParticle key={particle.id} {...particle} onComplete={handleParticleComplete} />
      ))}
    </div>
  );
};

export default CoinAnimationManager;