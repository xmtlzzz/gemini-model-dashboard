import React, { useEffect, useRef } from 'react';
import type { FlyingAtom } from '../types/lab';

interface FlyingAtomsLayerProps {
  atoms: FlyingAtom[];
  onAtomLanded: (id: number) => void;
}

const SingleFlyingAtom: React.FC<{
  atom: FlyingAtom;
  onLanded: (id: number) => void;
}> = ({ atom, onLanded }) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;

  useEffect(() => {
    const duration = 420;
    let start: number | null = null;
    let rafId = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(rafId);
      onLandedRef.current(atom.id);
    };

    const safety = window.setTimeout(finish, duration + 250);
    const peakY = Math.min(atom.startY, atom.endY) - 68;

    const animate = (now: number) => {
      if (done) return;
      if (start === null) start = now;
      const rawT = Math.max(0, Math.min(1, (now - start) / duration));
      const t = rawT < 0.5 ? 2 * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

      const midX = (atom.startX + atom.endX) / 2;
      const inv = 1 - t;
      const x = inv * inv * atom.startX + 2 * inv * t * midX + t * t * atom.endX;
      const y = inv * inv * atom.startY + 2 * inv * t * peakY + t * t * atom.endY;

      const scale = rawT < 0.72 ? 1 - rawT * 0.25 : Math.max(0.32, 0.82 - (rawT - 0.72) * 1.8);
      const rot = rawT * 210;
      const opacity = rawT > 0.85 ? Math.max(0, 1 - (rawT - 0.85) / 0.15) : 1;

      if (elRef.current) {
        elRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(2)}) rotate(${rot.toFixed(0)}deg)`;
        elRef.current.style.opacity = opacity.toFixed(2);
      }

      if (rawT < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        finish();
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      done = true;
      window.clearTimeout(safety);
      cancelAnimationFrame(rafId);
    };
  }, [atom]);

  return (
    <div
      ref={elRef}
      className="flying-atom-projectile"
      style={
        {
          '--atom-color': atom.color,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <span className="flying-atom-num">{atom.atomicNumber}</span>
      <span className="flying-atom-sym">{atom.symbol}</span>
    </div>
  );
};

export const FlyingAtomsLayer: React.FC<FlyingAtomsLayerProps> = ({
  atoms,
  onAtomLanded,
}) => {
  if (atoms.length === 0) return null;

  return (
    <div className="flying-atoms-layer" aria-hidden="true">
      {atoms.map((atom) => (
        <SingleFlyingAtom key={atom.id} atom={atom} onLanded={onAtomLanded} />
      ))}
    </div>
  );
};
