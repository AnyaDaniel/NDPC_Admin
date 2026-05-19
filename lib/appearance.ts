"use client";

export type AdminTheme = "light" | "dark";
export type AdminDensity = "compact" | "comfortable" | "roomy";

export const THEME_KEY = "ndpc_admin_theme";
export const DENSITY_KEY = "ndpc_admin_density";

export function readTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";
  const value = window.localStorage.getItem(THEME_KEY);
  return value === "dark" ? "dark" : "light";
}

export function readDensity(): AdminDensity {
  if (typeof window === "undefined") return "comfortable";
  const value = window.localStorage.getItem(DENSITY_KEY);
  if (value === "compact" || value === "comfortable" || value === "roomy") return value;
  return "comfortable";
}

export function applyAppearance(theme: AdminTheme, density: AdminDensity) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.setAttribute("data-density", density);
  window.localStorage.setItem(THEME_KEY, theme);
  window.localStorage.setItem(DENSITY_KEY, density);
}
