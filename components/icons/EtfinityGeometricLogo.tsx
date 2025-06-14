'use client'; 

import React from 'react';

const EtfinityGeometricLogo: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className, // Destructure className to apply it to the root SVG element
  ...props   // Capture any other standard SVG props to pass to the root <svg>
}) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 63 73"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
    className={className} // Apply the className prop here for external styling
    {...props} // Spread any other SVG props (like aria-label, role, etc.)
  >
    <rect x="0" y="0" width="63" height="73" fill="#A78BFA" />
    <g transform="translate(0.000000,73.000000) scale(0.100000,-0.100000)" fill="#27272A" stroke="none">
      <path d="M0 365 l0 -365 315 0 315 0 0 365 0 365 -315 0 -315 0 0 -365z m285 235 c17 -10 47 -37 69 -59 l39 -40 -34 -20 -34 -21 -36 36 c-91 89 -201 34 -202 -101 -1 -133 123 -223 260 -186 84 23 183 111 183 164 0 26 -38 67 -62 67 -24 0 -56 -17 -197 -102 -107 -65 -116 -69 -128 -52 -17 23 -16 24 132 114 171 104 168 102 220 94 58 -8 91 -35 106 -84 27 -88 -40 -194 -159 -252 -58 -29 -76 -33 -142 -32 -120 0 -200 48 -243 144 -52 114 1 303 97 346 37 16 88 10 131 -16z"/>
    </g>
  </svg>
);

export default EtfinityGeometricLogo;
