'use client';

import React from 'react';

// Define the interface for the props that TelegramIcon expects.
// It combines standard SVG attributes and your custom 'size' prop.
interface TelegramIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string; // Optional className prop for Tailwind CSS or other styles
  size?: number;      // Optional size prop, defaulting to 24
}

const TelegramIcon: React.FC<TelegramIconProps> = ({
  className,
  size = 24, // Destructure size with a default value
  ...props  // Capture any other standard SVG props to pass to the root <svg>
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size} // Dynamically set width based on prop
      height={size} // Dynamically set height based on prop
      viewBox="0 0 48 48" // This viewBox is from your provided SVG
      fill="none" // This is an outline icon, so fill is none
      stroke="currentColor" // This will make the stroke inherit text color (white/purple)
      strokeWidth="4" // Adjusted stroke width for better visibility at icon sizes
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className} // Pass any additional Tailwind classes
      {...props} // Spread any other SVG props (like aria-label, role, etc.)
    >
      <path d="M40.83,8.48c1.14,0,2,1,1.54,2.86l-5.58,26.3c-.39,1.87-1.52,2.32-3.08,1.45L20.4,29.26a.4.4,0,0,1,0-.65L35.77,14.73c.7-.62-.15-.92-1.07-.36L15.41,26.54a.46.46,0,0,1-.4.05L6.82,24C5,23.47,5,22.22,7.23,21.33L40,8.69a2.16,2.16,0,0,1,.83-.21Z"/>
    </svg>
  );
};

export default TelegramIcon;
