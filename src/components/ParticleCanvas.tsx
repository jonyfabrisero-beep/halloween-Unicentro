import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleTrigger {
  burstGhost: (x: number, y: number) => void;
  burstPumpkin: (x: number, y: number) => void;
  burstStars: (x: number, y: number) => void;
  burstDirt: (x: number, y: number) => void;
  burstTreeLeaves: (x: number, y: number) => void;
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

  // Resize canvas to match parent
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
          p.vx += Math.sin(p.rotation * 2) * 0.1;
          p.vx *= 0.98;
        } else {
          p.vx *= 0.96;
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
          // Tiny, intensely illuminated ghost sparkle with glowing aura
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.fill();

          // Brilliant white center core for intense luminescence
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(0.6, p.size * 0.45), 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 8;
          ctx.fill();
        } else if (p.type === 'dirt') {
          // Earthy soil speck
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else if (p.type === 'smoke') {
          // Soft glowing smoke puff
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
          ctx.shadowBlur = 8;
          ctx.fill();
        } else if (p.type === 'ring') {
          // Shockwave expanding ring with luminous aura
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          p.size += 2.0;
        } else if (p.type === 'candy') {
          // Wrapped candy piece
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
          // Candy wrapper twists
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.lineTo(-p.size * 1.6, -p.size * 0.6);
          ctx.lineTo(-p.size * 1.6, p.size * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(p.size, 0);
          ctx.lineTo(p.size * 1.6, -p.size * 0.6);
          ctx.lineTo(p.size * 1.6, p.size * 0.6);
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'leaf') {
          // Very small autumn leaf fluttering down
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.3);
          ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size * 1.3);
          ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size * 1.3);
          ctx.fillStyle = p.color;
          ctx.fill();

          // Tiny leaf spine
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 1.1);
          ctx.lineTo(0, p.size * 1.1);
          ctx.stroke();
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

  useImperativeHandle(ref, () => ({
    burstGhost(x: number, y: number) {
      // High-luminance ethereal neon spectrum: pure white, neon cyan, electric aqua, spectral mint, glowing violet
      const colors = ['#FFFFFF', '#38BDF8', '#67E8F9', '#A7F3D0', '#C084FC', '#F0ABFC'];

      // Thin ethereal luminous shockwave ring
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        alpha: 0.95,
        decay: 0.045,
        size: 4,
        color: '#67E8F9',
        rotation: 0,
        vRot: 0,
        type: 'ring',
        gravity: 0,
      });

      // 45 tiny, intensely illuminated sparkling motes
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 4.6;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          alpha: 1,
          decay: 0.016 + Math.random() * 0.018, // floats and shines smoothly
          size: 1.2 + Math.random() * 2.2, // much smaller: 1.2px to 3.4px
          color,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.2,
          type: 'glowMote',
          gravity: -0.025, // floats upwards like luminous stardust
        });
      }
    },

    burstPumpkin(x: number, y: number) {
      const candyColors = ['#F59E0B', '#EF4444', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24'];

      // Orange pulp shockwave
      particlesRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        alpha: 0.9,
        decay: 0.04,
        size: 6,
        color: '#F97316',
        rotation: 0,
        vRot: 0,
        type: 'ring',
        gravity: 0,
      });

      // Flying candies and pulp sparks
      for (let i = 0; i < 28; i++) {
        const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6; // Upward fountain
        const speed = 2.5 + Math.random() * 6;
        const isCandy = Math.random() > 0.4;
        const color = isCandy
          ? candyColors[Math.floor(Math.random() * candyColors.length)]
          : '#EA580C';

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.025 + Math.random() * 0.015,
          size: isCandy ? 6 + Math.random() * 4 : 3 + Math.random() * 4,
          color,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.35,
          type: isCandy ? 'candy' : 'spark',
          gravity: 0.16, // falls down nicely
        });
      }
    },

    burstStars(x: number, y: number) {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.025,
          size: 5 + Math.random() * 5,
          color: '#FDE047',
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.25,
          type: 'star',
          gravity: 0.05,
        });
      }
    },

    burstDirt(x: number, y: number) {
      const dirtColors = ['#5C3A21', '#78350F', '#8B4513', '#A0522D', '#92400E', '#451A03'];
      // Emits 24 small dirt, earth & soil specks
      for (let i = 0; i < 24; i++) {
        const angle = -Math.PI * 0.95 + Math.random() * Math.PI * 0.9; // Upward soil puff
        const speed = 1.5 + Math.random() * 4.5;
        const color = dirtColors[Math.floor(Math.random() * dirtColors.length)];

        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 25,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.95,
          decay: 0.02 + Math.random() * 0.02,
          size: 2 + Math.random() * 3.5,
          color,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.4,
          type: 'dirt',
          gravity: 0.22,
        });
      }
    },

    burstTreeLeaves(x: number, y: number) {
      // Warm autumn palette: rich pumpkin orange, golden amber, deep crimson, rustic yellow, russet
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

      // Shower 24 very small fluttering autumn leaves
      for (let i = 0; i < 24; i++) {
        const spreadX = (Math.random() - 0.5) * 45;
        const spreadY = (Math.random() - 0.5) * 40 - 25; // Centered on foliage crown
        const angle = -Math.PI * 0.8 + Math.random() * Math.PI * 0.6;
        const speed = 0.8 + Math.random() * 2.2;
        const color = leafColors[Math.floor(Math.random() * leafColors.length)];

        particlesRef.current.push({
          x: x + spreadX,
          y: y + spreadY,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
          vy: Math.sin(angle) * speed - 0.6,
          alpha: 1,
          decay: 0.007 + Math.random() * 0.006, // Floats all the way down smoothly
          size: 2.2 + Math.random() * 2.2, // Very small leaves (2.2px to 4.4px)
          color,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.22,
          type: 'leaf',
          gravity: 0.075 + Math.random() * 0.035, // Gentle fluttering descent
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
