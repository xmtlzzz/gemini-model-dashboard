import React, { useEffect, useRef } from 'react';
import type { ExplosionFragment, ExplosionPayload } from '../types/lab';

interface ExplosionOverlayProps {
  payload: ExplosionPayload | null;
  onComplete: () => void;
}

interface ShardBody {
  frag: ExplosionFragment;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  delay: number;
  trail: { cx: number; cy: number; rot: number }[];
}

interface FirePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  grow: number;
  life: number;
  maxLife: number;
  kind: 'core' | 'fire' | 'smoke';
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  isGlass: boolean;
  rot: number;
  vrot: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawFragmentShape(
  ctx: CanvasRenderingContext2D,
  frag: ExplosionFragment,
  alpha: number
) {
  const hw = frag.width / 2;
  const hh = frag.height / 2;

  ctx.globalAlpha = alpha;

  if (frag.kind === 'tile' || frag.kind === 'slot') {
    const accent = frag.accent ?? '#64748b';
    drawRoundedRect(ctx, -hw, -hh, frag.width, frag.height, frag.kind === 'slot' ? 9 : 6);

    if (frag.isModel) {
      ctx.fillStyle = '#1f222c';
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = alpha * 0.28;
      ctx.fillStyle = accent;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#25272f';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (frag.atomicNumber !== undefined) {
      ctx.fillStyle = frag.isModel ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.48)';
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(String(frag.atomicNumber), -hw + 3.5, -hh + 2.5);
    }

    if (frag.symbol) {
      ctx.fillStyle = frag.isModel ? '#ffffff' : '#e2e6ef';
      ctx.font = `600 ${frag.kind === 'slot' ? 14 : 11.5}px "Plus Jakarta Sans", Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frag.symbol, 0, frag.zhName ? 0.5 : 3);
    }
    if (frag.zhName) {
      ctx.fillStyle = frag.isModel ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.46)';
      ctx.font = '500 8px "Plus Jakarta Sans", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(frag.zhName, 0, hh - 2);
    }
    return;
  }

  if (frag.kind === 'heat-bar') {
    drawRoundedRect(ctx, -hw, -hh, frag.width, frag.height, hh);
    ctx.fillStyle = '#202229';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const [lowTxt, medTxt, highTxt] = frag.heatLabels ?? ['Low', 'Medium', 'High'];
    const labels: { key: 'low' | 'medium' | 'high'; text: string }[] = [
      { key: 'low', text: lowTxt },
      { key: 'medium', text: medTxt },
      { key: 'high', text: highTxt },
    ];
    const segW = frag.width / 3;
    labels.forEach((item, idx) => {
      const sx = -hw + idx * segW;
      const isActive = frag.heat === item.key;
      if (isActive) {
        drawRoundedRect(ctx, sx + 3, -hh + 3, segW - 6, frag.height - 6, (frag.height - 6) / 2);
        ctx.fillStyle =
          item.key === 'high' ? '#b83d14' : item.key === 'medium' ? '#926010' : '#1e5b7d';
        ctx.fill();
      }
      ctx.fillStyle = isActive ? '#ffffff' : '#9aa0aa';
      ctx.font = `${isActive ? '600' : '500'} 11px "Plus Jakarta Sans", Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.text, sx + segW / 2, 0.5);
    });
    return;
  }

  if (frag.kind === 'brew-btn') {
    drawRoundedRect(ctx, -hw, -hh, frag.width, frag.height, hh);
    ctx.fillStyle = '#f8b298';
    ctx.fill();
    ctx.fillStyle = '#361007';
    ctx.font = '600 13px "Plus Jakarta Sans", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frag.label ?? 'Brewing...', 0, 0.5);
    return;
  }

  if (frag.kind === 'title' && frag.label) {
    ctx.fillStyle = '#f3f6fb';
    ctx.font = '600 26px "Plus Jakarta Sans", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frag.label, 0, 0);
  }
}

export const ExplosionOverlay: React.FC<ExplosionOverlayProps> = ({
  payload,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!payload) return;

    const canvas = canvasRef.current;
    if (!canvas) {
      onCompleteRef.current();
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onCompleteRef.current();
      return;
    }

    let finished = false;
    let rafId = 0;

    const finishOnce = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      onCompleteRef.current();
    };

    const totalDuration = 2.35;
    // Guaranteed failsafe so the explosion overlay can NEVER get stuck on screen
    const safetyTimer = window.setTimeout(finishOnce, (totalDuration + 0.5) * 1000);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { epicenterX, epicenterY, color, fragments } = payload;

    // 2D rigid-body physics for all shattered tiles + Heat bar + Brew button + title
    const bodies: ShardBody[] = fragments.map((frag) => {
      const cx = frag.x + frag.width / 2;
      const cy = frag.y + frag.height / 2;
      const rx = cx - epicenterX;
      const ry = cy - epicenterY;
      const dist = Math.max(24, Math.hypot(rx, ry));
      const nx = rx / dist;
      const ny = ry / dist;

      const falloff = 1 / (0.34 + dist / 480);
      const speed = (540 + Math.random() * 580) * Math.min(2.2, falloff);
      const jitter = (Math.random() - 0.5) * 0.42;
      const cos = Math.cos(jitter);
      const sin = Math.sin(jitter);
      const dirX = nx * cos - ny * sin;
      const dirY = nx * sin + ny * cos;

      const isHeavy = frag.kind === 'heat-bar' || frag.kind === 'brew-btn';
      const massFactor = isHeavy ? 0.72 : 1;

      return {
        frag,
        cx,
        cy,
        vx: dirX * speed * massFactor,
        vy: (dirY * speed - 240 - Math.random() * 220) * massFactor,
        rot: 0,
        vrot: ((Math.random() - 0.5) * (isHeavy ? 5.6 : 14.5)), // radians/sec
        delay: Math.min(0.085, dist / 3200),
        trail: [],
      };
    });

    // Layered fireball & smoke plumes erupting from flask epicenter
    const puffs: FirePuff[] = [];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 260;
      const kind: FirePuff['kind'] = i < 7 ? 'core' : i < 18 ? 'fire' : 'smoke';
      puffs.push({
        x: epicenterX + (Math.random() - 0.5) * 30,
        y: epicenterY + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed * (kind === 'smoke' ? 1.1 : 0.75),
        vy: Math.sin(angle) * speed * 0.75 - (kind === 'smoke' ? 95 : 42),
        radius: kind === 'core' ? 44 + Math.random() * 34 : 58 + Math.random() * 50,
        grow: kind === 'smoke' ? 175 + Math.random() * 100 : 145 + Math.random() * 85,
        life: 0,
        maxLife:
          kind === 'core'
            ? 0.5 + Math.random() * 0.25
            : kind === 'fire'
              ? 1.0 + Math.random() * 0.45
              : 1.65 + Math.random() * 0.6,
        kind,
      });
    }

    // Embers & flask glass shards
    const sparks: SparkParticle[] = [];
    for (let i = 0; i < 64; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 280 + Math.random() * 880;
      const isGlass = i % 3 === 0;
      sparks.push({
        x: epicenterX + (Math.random() - 0.5) * 20,
        y: epicenterY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 170,
        size: isGlass ? 4 + Math.random() * 5.5 : 2 + Math.random() * 3.5,
        life: 0,
        maxLife: 0.65 + Math.random() * 1.1,
        color: isGlass ? 'rgba(226, 240, 255, 0.92)' : i % 2 === 0 ? '#ffb347' : color,
        isGlass,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 14,
      });
    }

    let startTime: number | null = null;
    let prevTime: number | null = null;

    const tick = (now: number) => {
      if (finished) return;

      try {
        if (startTime === null) {
          startTime = now;
          prevTime = now;
        }
        const elapsed = Math.max(0, (now - startTime) / 1000);
        const dt = Math.max(0, Math.min(0.033, (now - (prevTime ?? now)) / 1000));
        prevTime = now;

        ctx.clearRect(0, 0, width, height);

        // 1. Initial blinding detonation flash
        if (elapsed < 0.22) {
          const flashAlpha = Math.max(0, 1 - elapsed / 0.22) * 0.46;
          const flashRadius = Math.max(100, Math.max(width, height) * 0.85);
          const flashGrad = ctx.createRadialGradient(
            epicenterX,
            epicenterY,
            0,
            epicenterX,
            epicenterY,
            flashRadius
          );
          flashGrad.addColorStop(0, `rgba(255, 252, 232, ${Math.min(1, flashAlpha * 1.55)})`);
          flashGrad.addColorStop(0.32, `rgba(255, 162, 68, ${flashAlpha * 0.82})`);
          flashGrad.addColorStop(1, 'rgba(255, 100, 24, 0)');
          ctx.fillStyle = flashGrad;
          ctx.fillRect(0, 0, width, height);
        }

        // 2. Volumetric fireball & billowing smoke cloud
        for (const p of puffs) {
          p.life += dt;
          if (p.life >= p.maxLife) continue;
          const prog = Math.max(0, Math.min(1, p.life / p.maxLife));
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= Math.max(0, 1 - 1.65 * dt);
          p.vy *= Math.max(0, 1 - 1.35 * dt);
          p.vy -= 30 * dt;

          const r = Math.max(1, p.radius + p.grow * Math.pow(prog, 0.65));
          const fade =
            Math.sin(Math.min(1, prog * 3.5) * (Math.PI / 2)) *
            Math.pow(Math.max(0, 1 - prog), 1.35);

          if (fade <= 0.004) continue;

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
          if (p.kind === 'core') {
            grad.addColorStop(0, `rgba(255, 250, 212, ${fade * 0.9})`);
            grad.addColorStop(0.45, `rgba(255, 148, 38, ${fade * 0.62})`);
            grad.addColorStop(1, 'rgba(234, 88, 12, 0)');
          } else if (p.kind === 'fire') {
            grad.addColorStop(0, `rgba(249, 115, 22, ${fade * 0.54})`);
            grad.addColorStop(0.54, `rgba(176, 58, 16, ${fade * 0.32})`);
            grad.addColorStop(1, 'rgba(72, 22, 8, 0)');
          } else {
            grad.addColorStop(0, `rgba(54, 58, 68, ${fade * 0.5})`);
            grad.addColorStop(0.6, `rgba(26, 29, 36, ${fade * 0.26})`);
            grad.addColorStop(1, 'rgba(15, 16, 20, 0)');
          }
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 3. Expanding luminous shockwave ring (signature bright arc from video 00:20!)
        if (elapsed < 0.92) {
          const ringProg = Math.max(0, Math.min(1, elapsed / 0.92));
          const ringRadius = 24 + Math.pow(ringProg, 0.72) * Math.max(width, height) * 0.95;
          const ringAlpha = Math.pow(Math.max(0, 1 - ringProg), 1.45);

          ctx.save();
          ctx.beginPath();
          ctx.arc(epicenterX, epicenterY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 232, 185, ${ringAlpha * 0.28})`;
          ctx.lineWidth = Math.max(2, 14 * (1 - ringProg * 0.6));
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(epicenterX, epicenterY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 248, 226, ${ringAlpha * 0.9})`;
          ctx.lineWidth = Math.max(1.2, 3.2 * (1 - ringProg * 0.55));
          ctx.stroke();

          if (ringRadius > 80) {
            ctx.beginPath();
            ctx.arc(epicenterX, epicenterY, ringRadius * 0.84, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 210, 145, ${ringAlpha * 0.24})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
          ctx.restore();
        }

        // 4. All 125+ shattered tiles, Heat bar, and Brew button with physics + subtle motion trails!
        const fadeStart = 1.3;
        const baseAlpha =
          elapsed > fadeStart
            ? Math.max(0, 1 - (elapsed - fadeStart) / (totalDuration - fadeStart))
            : 1;

        for (const b of bodies) {
          if (elapsed >= b.delay && dt > 0) {
            b.trail.push({ cx: b.cx, cy: b.cy, rot: b.rot });
            if (b.trail.length > 2) b.trail.shift();

            b.cx += b.vx * dt;
            b.cy += b.vy * dt;
            b.vy += 980 * dt;
            b.vx *= Math.max(0, 1 - 0.36 * dt);
            b.rot += b.vrot * dt;
          }

          // Skip drawing shards completely offscreen
          if (
            b.cx < -180 ||
            b.cx > width + 180 ||
            b.cy < -180 ||
            b.cy > height + 180 ||
            baseAlpha <= 0.01
          ) {
            continue;
          }

          // Subtle motion-blur ghost trail on fast-moving shards
          if (b.trail.length > 0 && elapsed < 1.15) {
            const ghost = b.trail[0];
            ctx.save();
            ctx.translate(ghost.cx, ghost.cy);
            ctx.rotate(ghost.rot);
            drawFragmentShape(ctx, b.frag, baseAlpha * 0.22);
            ctx.restore();
          }

          ctx.save();
          ctx.translate(b.cx, b.cy);
          ctx.rotate(b.rot);
          drawFragmentShape(ctx, b.frag, baseAlpha);
          ctx.restore();
        }

        // 5. Flying sparks & glass shards
        for (const s of sparks) {
          s.life += dt;
          if (s.life >= s.maxLife) continue;
          const prog = Math.max(0, Math.min(1, s.life / s.maxLife));
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          s.vy += 980 * dt;
          s.vx *= Math.max(0, 1 - 0.65 * dt);
          s.rot += s.vrot * dt;
          const alpha = Math.pow(Math.max(0, 1 - prog), 1.1);

          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.rot);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          if (s.isGlass) {
            ctx.beginPath();
            ctx.moveTo(0, -s.size);
            ctx.lineTo(s.size * 0.65, s.size * 0.7);
            ctx.lineTo(-s.size * 0.55, s.size * 0.45);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, s.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        if (elapsed < totalDuration) {
          rafId = requestAnimationFrame(tick);
        } else {
          finishOnce();
        }
      } catch {
        finishOnce();
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      finished = true;
      window.clearTimeout(safetyTimer);
      cancelAnimationFrame(rafId);
    };
  }, [payload]);

  if (!payload) return null;

  return (
    <div className="explosion-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="explosion-canvas" />
    </div>
  );
};
