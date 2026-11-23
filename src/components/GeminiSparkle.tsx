import React from 'react';

interface GeminiSparkleProps {
  size?: number;
  className?: string;
  color?: string;
}

export const GeminiSparkle: React.FC<GeminiSparkleProps> = ({
  size = 18,
  className = '',
  color,
}) => {
  const gradId = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {!color && (
        <defs>
          <linearGradient id={gradId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8ab4f8" />
            <stop offset="55%" stopColor="#a8c7fa" />
            <stop offset="100%" stopColor="#c58af9" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M12 2C13.35 8.15 15.85 10.65 22 12C15.85 13.35 13.35 15.85 12 22C10.65 15.85 8.15 13.35 2 12C8.15 10.65 10.65 8.15 12 2Z"
        fill={color ?? `url(#${gradId})`}
      />
    </svg>
  );
};
