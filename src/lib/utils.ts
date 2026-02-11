import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getNum(val: string): number {
  if (!val) return 0;
  // For es-CL, "." is a thousands separator.
  // Remove all dots before parsing.
  return parseInt(String(val).replace(/\./g, ''), 10) || 0;
}
