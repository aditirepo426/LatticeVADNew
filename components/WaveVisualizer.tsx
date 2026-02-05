
import React, { useRef, useEffect } from 'react';

interface WaveVisualizerProps {
  isProcessing: boolean;
}

export const WaveVisualizer: React.FC<WaveVisualizerProps> = ({ isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = isProcessing ? '#3b82f6' : '#64748b';
      ctx.lineWidth = 2;

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x++) {
        const amplitude = isProcessing ? 20 : 5;
        const freq = isProcessing ? 0.05 : 0.02;
        const y = mid + Math.sin(x * freq + offset) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      offset += isProcessing ? 0.2 : 0.05;
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isProcessing]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={100} 
      className="w-full h-24 bg-slate-900 rounded-lg border border-slate-700 mb-4"
    />
  );
};
