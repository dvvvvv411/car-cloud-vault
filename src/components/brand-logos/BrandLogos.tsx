import React from 'react';

export const BMWLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="white" stroke="#0066B1" strokeWidth="4"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#0066B1" strokeWidth="2"/>
    <path d="M 50 10 L 50 90 M 10 50 L 90 50" stroke="#0066B1" strokeWidth="2"/>
    <path d="M 50 10 A 40 40 0 0 1 90 50 L 50 50 Z" fill="#0066B1"/>
    <path d="M 10 50 A 40 40 0 0 1 50 10 L 50 50 Z" fill="#0066B1"/>
    <path d="M 50 90 A 40 40 0 0 1 10 50 L 50 50 Z" fill="white"/>
    <path d="M 90 50 A 40 40 0 0 1 50 90 L 50 50 Z" fill="white"/>
  </svg>
);

export const VWLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#001E50" stroke="#001E50" strokeWidth="2"/>
    <g transform="translate(50, 50)">
      <path 
        d="M -18 -8 L -12 8 L -6 -2 L 0 8 L 6 -2 L 12 8 L 18 -8 L 10 -8 L 6 2 L 0 -8 L -6 2 L -10 -8 Z" 
        fill="white"
      />
      <rect x="-20" y="10" width="40" height="3" fill="white"/>
    </g>
  </svg>
);

export const GenericCarLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2"/>
    <g transform="translate(50, 50)" fill="hsl(var(--muted-foreground))">
      <path d="M -20 0 L -15 -10 L 15 -10 L 20 0 L 20 10 L -20 10 Z"/>
      <rect x="-12" y="-9" width="10" height="7" fill="hsl(var(--background))" opacity="0.7"/>
      <rect x="2" y="-9" width="10" height="7" fill="hsl(var(--background))" opacity="0.7"/>
      <circle cx="-12" cy="12" r="4" fill="hsl(var(--foreground))"/>
      <circle cx="12" cy="12" r="4" fill="hsl(var(--foreground))"/>
    </g>
  </svg>
);

export const getBrandLogo = (brand: string): React.ComponentType<{ className?: string }> => {
  const normalizedBrand = brand.toLowerCase();
  
  if (normalizedBrand.includes('bmw')) {
    return BMWLogo;
  }
  if (normalizedBrand.includes('volkswagen') || normalizedBrand.includes('vw')) {
    return VWLogo;
  }
  return GenericCarLogo;
};
