import { Platform } from 'react-native';

const claro = {
  text: '#0A2540',               // Azul marino corporativo para lectura nítida
  background: '#F3F6FA',         // Gris-azulado suave empresarial
  backgroundElement: '#FFFFFF',  // Blanco puro para tarjetas y paneles
  backgroundSelected: '#E6F0FA', // Azul claro suave para selección activa
  textSecondary: '#52667A',      // Gris pizarra medio para subtítulos
  acento: '#00549F',             // Azul institucional EPMAPS Agua de Quito
  laton: '#00549F',              // Acción principal unificada en azul corporativo EPMAPS
  rojoQuito: '#E1251B',          // Rojo institucional del logotipo EPMAPS / Quito
  linea: '#DCE4EE',              // Borde suave de tarjetas y divisores
  ok: '#15803D',                 // Verde corporativo de confirmación
  alerta: '#D97706',             // Ámbar de advertencia / pendiente
  error: '#DC2626',              // Rojo de error / anomalía
} as const;

export const Colors = { light: claro, dark: claro } as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
