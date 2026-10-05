import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleTrigger {
  burstGhost: (x: number, y: number, isPercent?: boolean) => void;
  burstPumpkin: (x: number, y: number, isPercent?: boolean) => void;
  burstStars: (x: number, y: number, isPercent?: boolean) => void;
  burstDirt: (x: number, y: number, isPercent?: boolean) => void;
  burstTreeLeaves: (x: number, y: number, isPercent?: boolean) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  type: 'spark' | 'smoke' | 'ring' | 'candy' | 'star' | 'dirt' | 'glowMote' | 'leaf';
  gravity: number;
}

export const ParticleCanvas = forwardRef<ParticleTrigger, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Resize canvas to match parent element precisely
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth || window.innerWidth;
      const height = parent.clientHeight || window.innerHeight;
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    const observer = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        if (p.type === 'leaf') {
          // Gentle fluttering air drift
          p.vx += Math.sin(p.rotation * 2) * 0.08;
          p.vx *= 0.98;
        } else {
          p.vx *= 0.95;
        }
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === 'glowMote') {
          // Responsive sparkling ghost mote with delicate glow aura
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = Math.max(2, Math.round(p.size * 3.2));
          ctx.fill();

          // White center core
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.4, p.size * 0.45), 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = Math.max(1, Math.round(p.size * 1.8));
          ctx.fill();
        } else if (p.type === 'dirt') {
          // Fine earthy soil speck
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'smoke') {
          // Soft smoke puff
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'spark') {
          // Sharp diamond spark
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size * 0.4, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size * 0.4, 0);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = Math.max(1, Math.round(p.size * 2));
          ctx.fill();
        } else if (p.type === 'ring') {
          // Expanding luminous shockwave ring
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = Math.max(2, Math.round(p.size * 1.2));
          ctx.lineWidth = Math.max(0.8, p.size * 0.18);
          ctx.stroke();
          p.size += 1.2;
        } else if (p.type === 'candy') {
          // Cute miniature wrapped candy piece (responsive proportions)
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
          // Candy wrapper twists
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(-p.size * 1.5, -p.size * 0.55);
          ctx.lineTo(-p.size * 1.5, p.size * 0.55);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(p.size, 0);
          ctx.lineTo(p.size * 1.5, -p.size * 0.55);
          ctx.lineTo(p.size * 1.5, p.size * 0.55);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'leaf') {
          // Delicate fluttering autumn leaf
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.2);
          ctx.quadraticCurveTo(p.size * 0.7, 0, 0, p.size * 1.2);
          ctx.quadraticCurveTo(-p.size * 0.7, 0, 0, -p.size * 1.2);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Tiny leaf spine
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.0);
          ctx.lineTo(0, p.size * 1.0);
          ctx.stroke();
        } else if (p.type === 'star') {
          // Golden star
          ctx.beginPath();
          for (let s = 0; s < 5; s++) {
            const rot = (Math.PI / 5) * 2 * s - Math.PI / 2;
            const rx = Math.cos(rot) * p.size;
            const ry = Math.sin(rot) * p.size;
            if (s === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);

            const rotInner = rot + Math.PI / 5;
            ctx.lineTo(Math.cos(rotInner) * (p.size * 0.45), Math.sin(rotInner) * (p.size * 0.45));
          }
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = Math.max(1, Math.round(p.size * 1.5));
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Helper to resolve coordinates whether passed as percentage (0-100) or screen pixels
  const resolveCoordinates = (inX: number, inY: number, isPercent?: boolean): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      return { x: inX, y: inY };
    }

    // If explicitly marked as percentage, or if inX and inY are in 0-100 range
    if (isPercent || (inX >= 0 && inX <= 100 && inY >= 0 && inY <= 100)) {
      return {
        x: (inX / 100) * canvas.width,
        y: (inY / 100) * canvas.height,
      };
    }

    // If screen coordinates were provided, convert via canvas bounding rect
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return {
        x: (inX - rect.left) * (canvas.width / rect.width),
        y: (inY - rect.top) * (canvas.height / rect.height),
      };
    }

    return { x: inX, y: inY };
  };

  // Dynamic responsive scaling factor: on mobile phone screens (~600-800px), particles scale down to ~45-55%
  const getResponsiveScale = (): number => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return 1;
    // Base reference width: 1400px. Clamped between 0.42 and 1.15
    return Math.max(0.42, Math.min(1.15, canvas.width / 1350));
  };

  useImperativeHandle(ref, () => ({
    burstGhost(rawX: number, rawY: number, isPercent?: boolean) {
      const { x, y } = resolveCoordinates(rawX, rawY, isPercent);
      const scale = getResponsiveScale();

      const colors = ['#FFFFFF', '#38BDF8', '#67E8F9', '#A7F3D0', '#C084FC', '#F0ABFC'];

      // Ethereal luminous shockwave ring
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        alpha: 0.95,
        decay: 0.045,
        size: Math.max(2, 3.5 * scale),
        color: '#67E8F9',
        rotation: 0,
        vRot: 0,
        type: 'ring',
        gravity: 0,
      });

      // 36 delicate, intensely illuminated sparkling motes
      for (let i = 0; i < 36; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.0 + Math.random() * 3.5) * scale;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.8 * scale,
          alpha: 1,
          decay: 0.018 + Math.random() * 0.018,
          size: (0.7 + Math.random() * 1.5) * scale, // Clean, tiny sparkles (0.7px - 2.2px)
          color,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
          type: 'glowMote',
          gravity: -0.02 * scale, // Floats upward
        });
      }
    },

    burstPumpkin(rawX: number, rawY: number, isPercent?: boolean) {
      const { x, y } = resolveCoordinates(rawX, rawY, isPercent);
      const scale = getResponsiveScale();

      const candyColors = ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24'];

      // Orange pulp shockwave
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        alpha: 0.9,
        decay: 0.04,
        size: Math.max(2.5, 5 * scale),
        color: '#F97316',
        rotation: 0,
        vRot: 0,
        type: 'ring',
        gravity: 0,
      });

      // Flying cute candies and pulp sparks
      for (let i = 0; i < 22; i++) {
        const angle = -Math.PI * 0.85 + Math.random() * Math.PI * 0.7; // Upward fountain
        const speed = (1.8 + Math.random() * 4.2) * scale;
        const isCandy = Math.random() > 0.45;
        const color = isCandy
          ? candyColors[Math.floor(Math.random() * candyColors.length)]
          : '#EA580C';

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.026 + Math.random() * 0.015,
          size: (isCandy ? 2.4 + Math.random() * 1.6 : 1.4 + Math.random() * 1.6) * scale,
          color,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.35,
          type: isCandy ? 'candy' : 'spark',
          gravity: 0.14 * scale,
        });
      }
    },

    burstStars(rawX: number, rawY: number, isPercent?: boolean) {
      const { x, y } = resolveCoordinates(rawX, rawY, isPercent);
      const scale = getResponsiveScale();

      for (let i = 0; i < 18; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (1.6 + Math.random() * 3.2) * scale;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.025,
          size: (2.2 + Math.random() * 2.5) * scale,
          color: '#FDE047',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.25,
          type: 'star',
          gravity: 0.04 * scale,
        });
      }
    },

    burstDirt(rawX: number, rawY: number, isPercent?: boolean) {
      const { x, y } = resolveCoordinates(rawX, rawY, isPercent);
      const scale = getResponsiveScale();

      const dirtColors = ['#5C3A21', '#78350F', '#8B4513', '#A0522D', '#92400E', '#451A03'];

      for (let i = 0; i < 20; i++) {
        const angle = -Math.PI * 0.95 + Math.random() * Math.PI * 0.9;
        const speed = (1.2 + Math.random() * 3.2) * scale;
        const color = dirtColors[Math.floor(Math.random() * dirtColors.length)];

        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 16 * scale,
          y: y + (Math.random() - 0.5) * 6 * scale,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.95,
          decay: 0.022 + Math.random() * 0.02,
          size: (1.0 + Math.random() * 1.8) * scale,
          color,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.4,
          type: 'dirt',
          gravity: 0.18 * scale,
        });
      }
    },

    burstTreeLeaves(rawX: number, rawY: number, isPercent?: boolean) {
      const { x, y } = resolveCoordinates(rawX, rawY, isPercent);
      const scale = getResponsiveScale();

      const leafColors = [
        '#F97316',
        '#EA580C',
        '#F59E0B',
        '#EAB308',
        '#DC2626',
        '#B91C1C',
        '#B45309',
        '#78350F',
      ];

      for (let i = 0; i < 20; i++) {
        const spreadX = (Math.random() - 0.5) * 36 * scale;
        const spreadY = (Math.random() - 0.5) * 28 * scale - 12 * scale;
        const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6;
        const speed = (0.6 + Math.random() * 1.8) * scale;
        const color = leafColors[Math.floor(Math.random() * leafColors.length)];

        particlesRef.current.push({
          x: x + spreadX,
          y: y + spreadY,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.2 * scale,
          vy: Math.sin(angle) * speed - 0.4 * scale,
          alpha: 1,
          decay: 0.008 + Math.random() * 0.006,
          size: (1.5 + Math.random() * 1.8) * scale,
          color,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.22,
          type: 'leaf',
          gravity: (0.05 + Math.random() * 0.03) * scale,
        });
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
});
