import React from 'react';
import type { HeatLevel, ReactionType } from '../types/lab';

interface ErlenmeyerFlaskProps {
  liquidColor: string;
  slotCount: number;
  heat: HeatLevel;
  reactionType: ReactionType;
  isRadioactive: boolean;
  isBrewing: boolean;
  isDragOver: boolean;
  splashTick: number;
  dropHintText?: string;
  flaskRef?: React.RefObject<HTMLDivElement | null>;
  neckAnchorRef?: React.RefObject<HTMLDivElement | null>;
}

export const ErlenmeyerFlask: React.FC<ErlenmeyerFlaskProps> = ({
  liquidColor,
  slotCount,
  heat,
  reactionType,
  isRadioactive,
  isBrewing,
  isDragOver,
  splashTick,
  dropHintText = 'Drop in',
  flaskRef,
  neckAnchorRef,
}) => {
  const clipId = React.useId();
  const liquidGradId = React.useId();
  const glowGradId = React.useId();
  const steamBlurId = React.useId();

  // Fill rises dramatically with 5-6 elements (matches screenshot 2 ~82% full!)
  const fillRatio =
    slotCount === 0
      ? 0.12
      : Math.min(0.88, 0.28 + slotCount * 0.115 + (isBrewing ? 0.08 : 0));
  const liquidTopY = 132 - fillRatio * 68;

  const isExtreme =
    isBrewing && (reactionType === 'explosion' || reactionType === 'volatile');

  const bubbleSpeedClass = isExtreme
    ? 'flask-speed-extreme'
    : isBrewing
      ? 'flask-speed-brewing'
      : heat === 'high'
        ? 'flask-speed-high'
        : heat === 'medium'
          ? 'flask-speed-medium'
          : 'flask-speed-low';

  const showVapor =
    slotCount > 0 &&
    (heat !== 'low' || isRadioactive || isBrewing || reactionType === 'explosion');

  const heavySteam =
    slotCount > 0 &&
    (isExtreme ||
      reactionType === 'explosion' ||
      (heat === 'high' && (slotCount >= 2 || isRadioactive)));

  return (
    <div
      ref={flaskRef}
      className={[
        'flask-zone',
        bubbleSpeedClass,
        isDragOver ? 'flask-drag-over' : '',
        isBrewing ? 'flask-brewing' : '',
        isExtreme ? 'flask-extreme-tilt' : '',
        isRadioactive && slotCount > 0 ? 'flask-radioactive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--liquid-color': liquidColor,
        } as React.CSSProperties
      }
      aria-label="Chemistry brewing flask drop target"
    >
      {/* Invisible exact anchor at flask neck mouth for parabolic drop physics */}
      <div ref={neckAnchorRef} className="flask-neck-anchor" aria-hidden="true" />

      {/* Thermal under-glow */}
      <div
        className={`flask-heat-glow heat-${heat} ${slotCount === 0 ? 'empty' : ''} ${
          isExtreme ? 'extreme' : ''
        }`}
      />

      {/* Drop target pulse ring */}
      {isDragOver && (
        <div className="flask-drop-indicator">
          <span>{dropHintText}</span>
        </div>
      )}

      <svg
        viewBox="0 0 120 144"
        className="flask-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Inner flask cavity clip */}
          <clipPath id={clipId}>
            <path d="M51 44 L51 62 L20 121 C17.5 125.8 21 131.5 26.5 131.5 L93.5 131.5 C99 131.5 102.5 125.8 100 121 L69 62 L69 44 Z" />
          </clipPath>

          <linearGradient
            id={liquidGradId}
            x1="60"
            y1={liquidTopY}
            x2="60"
            y2="134"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.96" />
            <stop offset="52%" stopColor={liquidColor} stopOpacity="0.84" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0.64" />
          </linearGradient>

          <radialGradient id={glowGradId} cx="50%" cy="68%" r="48%">
            <stop
              offset="0%"
              stopColor={liquidColor}
              stopOpacity={slotCount > 0 ? (isExtreme ? '0.68' : '0.45') : '0.12'}
            />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0" />
          </radialGradient>

          <filter id={steamBlurId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Rising vapor / heavy white-gray steam plume (matches screenshot 2!) */}
        {showVapor && (
          <g className={`flask-vapor-group ${heavySteam ? 'heavy-steam' : ''}`}>
            <g filter={`url(#${steamBlurId})`}>
              <circle
                cx="60"
                cy="30"
                r={heavySteam ? 14 : 10}
                className="vapor-puff vapor-1"
                fill={
                  heavySteam
                    ? 'rgba(235, 240, 248, 0.56)'
                    : isRadioactive
                      ? 'rgba(163, 230, 53, 0.28)'
                      : 'rgba(200, 210, 226, 0.25)'
                }
              />
              <circle
                cx="54"
                cy="18"
                r={heavySteam ? 13 : 8.5}
                className="vapor-puff vapor-2"
                fill={
                  heavySteam
                    ? 'rgba(224, 230, 240, 0.48)'
                    : isRadioactive
                      ? 'rgba(163, 230, 53, 0.2)'
                      : 'rgba(180, 192, 210, 0.2)'
                }
              />
              <circle
                cx="66"
                cy="12"
                r={heavySteam ? 11 : 6.5}
                className="vapor-puff vapor-3"
                fill={
                  heavySteam
                    ? 'rgba(215, 222, 235, 0.42)'
                    : 'rgba(203, 213, 225, 0.18)'
                }
              />
            </g>
            {!heavySteam && (
              <circle
                cx="60"
                cy="30"
                r="8.5"
                className="vapor-core"
                fill="rgba(70, 74, 84, 0.48)"
              />
            )}
          </g>
        )}

        {/* Ambient inner liquid glow */}
        <ellipse cx="60" cy="108" rx="44" ry="32" fill={`url(#${glowGradId})`} />

        {/* Subtle translucent glass background fill */}
        <path
          d="M50 38 L50 61.5 L18.5 121.5 C15.6 127 19.6 133.5 26 133.5 L94 133.5 C100.4 133.5 104.4 127 101.5 121.5 L70 61.5 L70 38"
          fill="rgba(255, 255, 255, 0.038)"
        />

        {/* Animated Liquid Clipped to Flask Interior */}
        <g clipPath={`url(#${clipId})`}>
          {/* Back wave */}
          <g className="liquid-wave-back" style={{ transform: `translateY(${liquidTopY}px)` }}>
            <path
              d="M-60 4 Q-30 -3 0 4 T60 4 T120 4 T180 4 T240 4 L240 120 L-60 120 Z"
              fill={liquidColor}
              fillOpacity="0.48"
            />
          </g>

          {/* Front wave */}
          <g className="liquid-wave-front" style={{ transform: `translateY(${liquidTopY}px)` }}>
            <path
              d="M-60 2 Q-30 8 0 2 T60 2 T120 2 T180 2 T240 2 L240 120 L-60 120 Z"
              fill={`url(#${liquidGradId})`}
            />
            {/* Frothy meniscus foam highlights (matches bubbly pink liquid in screenshot 1!) */}
            {slotCount > 0 && (
              <g className="meniscus-foam" opacity={isBrewing ? 0.85 : 0.58}>
                <circle cx="36" cy="5" r="3.4" fill="rgba(255,255,255,0.42)" />
                <circle cx="48" cy="3" r="4.5" fill="rgba(255,255,255,0.34)" />
                <circle cx="62" cy="5" r="3.8" fill="rgba(255,255,255,0.45)" />
                <circle cx="76" cy="4" r="4.1" fill="rgba(255,255,255,0.35)" />
                <circle cx="86" cy="6" r="2.8" fill="rgba(255,255,255,0.38)" />
              </g>
            )}
            {/* Meniscus highlight line */}
            <path
              d="M-60 2 Q-30 8 0 2 T60 2 T120 2 T180 2 T240 2"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.4"
              fill="none"
            />
          </g>

          {/* Rich layered bubbles rising inside liquid */}
          {slotCount > 0 && (
            <g className="flask-bubbles">
              <circle cx="34" cy="126" r="3.6" fill="rgba(255,255,255,0.36)" className="bubble b1" />
              <circle cx="46" cy="124" r="5.1" fill="rgba(255,255,255,0.28)" stroke="rgba(255,255,255,0.38)" strokeWidth="0.7" className="bubble b2" />
              <circle cx="58" cy="127" r="2.8" fill="rgba(255,255,255,0.52)" className="bubble b3" />
              <circle cx="69" cy="123" r="4.6" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" className="bubble b4" />
              <circle cx="81" cy="126" r="3.4" fill="rgba(255,255,255,0.4)" className="bubble b5" />
              <circle cx="40" cy="129" r="2.4" fill="rgba(255,255,255,0.55)" className="bubble b6" />
              <circle cx="63" cy="128" r="3.9" fill="rgba(255,255,255,0.34)" className="bubble b7" />
              <circle cx="75" cy="128" r="2.6" fill="rgba(255,255,255,0.48)" className="bubble b8" />
            </g>
          )}

          {/* Drop splash droplets when an element plunges in */}
          {splashTick > 0 && (
            <g key={splashTick} className="flask-splash">
              <circle cx="48" cy={liquidTopY} r="2.8" fill="#ffffff" className="splash-dot s1" />
              <circle cx="60" cy={liquidTopY - 2} r="3.6" fill={liquidColor} className="splash-dot s2" />
              <circle cx="72" cy={liquidTopY} r="2.6" fill="#ffffff" className="splash-dot s3" />
              <circle cx="55" cy={liquidTopY - 1} r="2.2" fill="#ffffff" className="splash-dot s4" />
              <circle cx="66" cy={liquidTopY - 1} r="2.4" fill={liquidColor} className="splash-dot s5" />
            </g>
          )}
        </g>

        {/* Brewing sparks / intense critical flares rising out of the neck */}
        {isBrewing && (
          <g className="flask-sparks">
            <circle cx="56" cy="40" r="2.4" fill="#ffffff" className="spark sp1" />
            <circle cx="64" cy="36" r="3" fill={liquidColor} className="spark sp2" />
            <circle cx="60" cy="42" r="2.2" fill="#fde68a" className="spark sp3" />
            <circle cx="53" cy="32" r="2" fill={liquidColor} className="spark sp4" />
            {isExtreme && (
              <>
                <circle cx="67" cy="28" r="2.8" fill="#fb923c" className="spark sp5" />
                <circle cx="50" cy="38" r="2.6" fill="#fef08a" className="spark sp6" />
              </>
            )}
          </g>
        )}

        {/* Glass highlights & measurement tick marks */}
        <path
          d="M53.5 64 L30 112"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <g stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1" strokeLinecap="round">
          <line x1="76" y1="90" x2="81" y2="90" />
          <line x1="80" y1="101" x2="86" y2="101" />
          <line x1="84" y1="112" x2="91" y2="112" />
        </g>

        {/* Outer Erlenmeyer Flask Glass Contour */}
        <path
          d="M46 38 L74 38"
          stroke="rgba(226, 232, 240, 0.64)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M50 38 L50 61.5 L18.5 121.5 C15.6 127 19.6 133.5 26 133.5 L94 133.5 C100.4 133.5 104.4 127 101.5 121.5 L70 61.5 L70 38"
          stroke="rgba(226, 232, 240, 0.5)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
