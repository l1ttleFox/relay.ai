import React, { useEffect, useRef } from 'react';
import { Sparkles, PowerOff } from 'lucide-react';
import { useI18n } from './i18n';

/**
 * Ambient background: a slow particle constellation on canvas plus
 * drifting aurora orbs. Lightweight: pauses on hidden tabs, respects
 * prefers-reduced-motion, scales particle count to viewport area.
 * Can be fully disabled via <AmbientToggle /> for weak hardware.
 */
export function Ambient() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -1e4, y: -1e4 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let raf = 0;
    let running = true;

    function seed() {
      const count = Math.min(120, Math.max(36, Math.round((width * height) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 0.5 + Math.random() * 1.4,
        // occasional accent tint among mostly white dots
        hue: Math.random() < 0.16 ? 200 + Math.random() * 60 : null,
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduced) draw(); // single static frame
    }

    const LINK = 132;
    function draw() {
      ctx.clearRect(0, 0, width, height);

      // links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK) continue;
          const alpha = (1 - dist / LINK) * 0.14;
          ctx.strokeStyle = `rgba(190, 205, 235, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // pointer halo links
      for (const p of particles) {
        const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (d < 190) {
          const alpha = (1 - d / 190) * 0.22;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }

      // dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue == null
          ? 'rgba(230, 236, 248, 0.5)'
          : `hsla(${p.hue}, 80%, 75%, 0.55)`;
        ctx.fill();
      }
    }

    function tick() {
      if (!running) return;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // gentle attraction toward the pointer
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 220 && d > 0.001) {
          p.vx += (dx / d) * 0.004;
          p.vy += (dy / d) * 0.004;
        }
        // clamp speed
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 0.45) { p.vx *= 0.45 / speed; p.vy *= 0.45 / speed; }
        // wrap around edges
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        if (p.y < -8) p.y = height + 8;
        if (p.y > height + 8) p.y = -8;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }

    function onPointerMove(e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    function onPointerLeave() {
      pointer.x = -1e4;
      pointer.y = -1e4;
    }
    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduced) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    }

    resize();
    if (!reduced) raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <div className="ambient" aria-hidden="true">
    <div className="ambient-aurora">
      <span className="orb orb-1" />
      <span className="orb orb-2" />
      <span className="orb orb-3" />
    </div>
    <canvas ref={canvasRef} className="ambient-canvas" />
    <div className="ambient-glow" />
    <div className="ambient-grid" />
    <div className="ambient-noise" />
  </div>;
}

/** Button that toggles the animated ambient background on/off (persisted). */
export function AmbientToggle({ on, onToggle }) {
  const { t } = useI18n();
  const label = on ? t('ambient.toggleOn') : t('ambient.toggleOff');
  return <button
    type="button"
    className={`ambient-toggle ${on ? 'is-on' : ''}`}
    onClick={onToggle}
    title={label}
    aria-label={label}
    aria-pressed={on}
  >{on ? <Sparkles size={15} /> : <PowerOff size={15} />}</button>;
}
