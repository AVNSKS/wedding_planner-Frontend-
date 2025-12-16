import React, { useEffect, useRef } from 'react';

const GalaxyBackground = ({ opacity = 1, reduced = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduced) return; // Skip animation for reduced motion

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let stars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 8000));
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          opacity: Math.random(),
          speed: Math.random() * 0.3 + 0.1,
          twinkleSpeed: Math.random() * 0.02 + 0.005
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = '#0B1226';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
      );
      gradient.addColorStop(0, 'rgba(14,165,164,0.08)');
      gradient.addColorStop(0.5, 'rgba(167,139,250,0.04)');
      gradient.addColorStop(1, 'rgba(11,18,38,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * opacity})`;
        ctx.fill();

        // Slow drift
        star.y += star.speed * 0.1;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
      });

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
    // Static fallback for reduced motion
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

export default GalaxyBackground;
