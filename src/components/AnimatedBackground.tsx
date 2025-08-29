import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation variables
    const lines: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      opacity: number;
      speed: number;
      angle: number;
    }> = [];

    // Create initial lines
    for (let i = 0; i < 50; i++) {
      lines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw lines
      lines.forEach((line, index) => {
        // Mouse interaction
        const mouseDistance = Math.sqrt(
          Math.pow(mouseRef.current.x - line.x1, 2) + 
          Math.pow(mouseRef.current.y - line.y1, 2)
        );
        
        const mouseInfluence = Math.max(0, 1 - mouseDistance / 200);
        const dynamicOpacity = line.opacity + mouseInfluence * 0.3;

        // Animate line movement
        line.x1 += Math.cos(line.angle) * line.speed;
        line.y1 += Math.sin(line.angle) * line.speed;
        line.x2 += Math.cos(line.angle + Math.PI / 4) * line.speed;
        line.y2 += Math.sin(line.angle + Math.PI / 4) * line.speed;

        // Wrap around screen
        if (line.x1 > canvas.width) line.x1 = 0;
        if (line.x1 < 0) line.x1 = canvas.width;
        if (line.y1 > canvas.height) line.y1 = 0;
        if (line.y1 < 0) line.y1 = canvas.height;
        if (line.x2 > canvas.width) line.x2 = 0;
        if (line.x2 < 0) line.x2 = canvas.width;
        if (line.y2 > canvas.height) line.y2 = 0;
        if (line.y2 < 0) line.y2 = canvas.height;

        // Draw line with gradient
        const lineGradient = ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y2);
        lineGradient.addColorStop(0, `rgba(251, 113, 133, ${dynamicOpacity})`);
        lineGradient.addColorStop(0.5, `rgba(249, 115, 22, ${dynamicOpacity * 0.8})`);
        lineGradient.addColorStop(1, `rgba(245, 101, 101, ${dynamicOpacity * 0.6})`);

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 1 + mouseInfluence * 2;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    />
  );
};

export default AnimatedBackground;