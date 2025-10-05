import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserColor(email: string | null): string {
  if (!email) {
    return "bg-gray-100 text-gray-800 border-gray-300";
  }

  // Spezifische Farben für bekannte Benutzer
  if (email === "admin@admin.de") {
    return "bg-purple-100 text-purple-800 border-purple-300";
  }
  if (email === "x959@caller.de") {
    return "bg-cyan-100 text-cyan-800 border-cyan-300";
  }

  // Deterministische Farbgenerierung für andere Benutzer
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-rose-100 text-rose-800 border-rose-300",
    "bg-teal-100 text-teal-800 border-teal-300",
    "bg-amber-100 text-amber-800 border-amber-300",
  ];

  // Hash-basierte Farbauswahl
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  
  return colors[index];
}
