import React, { useEffect, useRef } from 'react';

const OrbBackground = ({ opacity = 1, reduced = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawOrb = (x, y, radius, color, blur) => {
      ctx.save();
      ctx.filter = `blur(${blur}px)`;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      time += 0.003;
      
      // Dark base
      ctx.fillStyle = '#0B1226';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Large moving orbs
      drawOrb(
        centerX + Math.sin(time) * 200,
        centerY + Math.cos(time * 0.7) * 150,
        300,
        'rgba(14,165,164,0.25)',
        60
      );

      drawOrb(
        centerX - Math.cos(time * 0.8) * 180,
        centerY + Math.sin(time * 0.6) * 180,
        280,
        'rgba(167,139,250,0.2)',
        50
      );

      drawOrb(
        centerX + Math.sin(time * 1.2) * 160,
        centerY - Math.cos(time * 0.9) * 140,
        250,
        'rgba(255,122,89,0.15)',
        55
      );

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [opacity, reduced]);

  if (reduced) {
    return (
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(120deg, #0B1226 0%, rgba(14,165,164,0.12) 20%, rgba(167,139,250,0.08) 55%, rgba(255,122,89,0.06) 100%)',
          opacity
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 -z-10"
      style={{ opacity }}
    />
  );
};

export default OrbBackground;
