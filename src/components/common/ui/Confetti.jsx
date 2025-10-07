/**
 * Confetti Component - Success celebration animation
 * Week 2: Micro-interactions & Animations
 * 
 * Features:
 * - Confetti explosion animation
 * - Customizable colors and duration
 * - Auto-cleanup after animation
 * - Performance optimized
 * 
 * @example
 * <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
 */

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const Confetti = ({
  active = false,
  duration = 3000,
  particleCount = 50,
  colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'],
  onComplete,
}) => {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);

  // Create particles
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: -20,
      velocityX: (Math.random() - 0.5) * 10,
      velocityY: Math.random() * -15 - 10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      gravity: 0.5,
      opacity: 1,
      life: 1,
    }));

    setParticles(newParticles);
  }, [active, particleCount, colors]);

  // Animation loop
  useEffect(() => {
    if (!active || particles.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= duration) {
        setParticles([]);
        if (onComplete) onComplete();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles((prevParticles) => {
        return prevParticles.map((particle) => {
          // Update physics
          const newParticle = {
            ...particle,
            x: particle.x + particle.velocityX,
            y: particle.y + particle.velocityY,
            velocityY: particle.velocityY + particle.gravity,
            rotation: particle.rotation + particle.rotationSpeed,
            opacity: Math.max(0, 1 - elapsed / duration),
            life: Math.max(0, 1 - elapsed / duration),
          };

          // Draw particle
          ctx.save();
          ctx.translate(newParticle.x, newParticle.y);
          ctx.rotate((newParticle.rotation * Math.PI) / 180);
          ctx.globalAlpha = newParticle.opacity;
          ctx.fillStyle = newParticle.color;
          ctx.fillRect(
            -newParticle.size / 2,
            -newParticle.size / 2,
            newParticle.size,
            newParticle.size
          );
          ctx.restore();

          return newParticle;
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [active, particles, duration, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

// Confetti trigger component
const ConfettiTrigger = ({ trigger, children, ...props }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowConfetti(true);
    }
  }, [trigger]);

  return (
    <>
      {children}
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
        {...props}
      />
    </>
  );
};

Confetti.Trigger = ConfettiTrigger;

Confetti.propTypes = {
  active: PropTypes.bool,
  duration: PropTypes.number,
  particleCount: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  onComplete: PropTypes.func,
};

ConfettiTrigger.propTypes = {
  trigger: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default Confetti;
