import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function sleep(ms: number) {
  if (ms <= 0 || prefersReducedMotion()) return Promise.resolve();
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function formatNum(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}
