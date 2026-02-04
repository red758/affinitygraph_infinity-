
import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const Logo: React.FC<Props> = ({ className = "", size = 48 }) => {
  // Maintaining the precise 320:400 aspect ratio provided by the user
  const height = (size * 400) / 320;
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center transition-all duration-300 ${className}`} 
      style={{ width: size, height: height }}
    >
      <svg 
        viewBox="0 0 320 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Main stylized 'A' structure - Sharp, clean geometry */}
        <path 
          d="M160 20 L270 380 L220 380 L160 160 L100 380 L50 380 L160 20 Z" 
          fill="currentColor"
        />
        {/* The elegant calligraphic loop - Mathematical precision without glow */}
        <path 
          d="M 30 140 C 120 120, 180 140, 240 180 C 300 220, 320 280, 280 340 C 240 400, 180 360, 190 320 C 200 280, 260 260, 280 180 C 300 100, 150 80, 30 140 Z" 
          fill="currentColor"
        />
      </svg>
    </div>
  );
};

export default Logo;
