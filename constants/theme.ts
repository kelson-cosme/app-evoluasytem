// constants/theme.ts

// Inspirado nas suas variáveis CSS do projeto web
//
const palette = {
  primary: '#111827',     // O seu --primary (dark blue/black)
  accent: '#3B82F6',       // O seu --accent (blue)
  background: '#F9FAFB',  // Um branco --background ligeiramente cinza
  card: '#FFFFFF',         // O seu --card (branco puro)
  text: '#1F2937',         // O seu --foreground
  textSecondary: '#6B7280', // O seu --muted-foreground
  border: '#E5E7EB',       // O seu --border
  error: '#EF4444',        // Vermelho para erros
};

export const Colors = {
  light: {
    text: palette.text,
    background: palette.background,
    tint: palette.accent,
    icon: palette.textSecondary,
    tabIconDefault: palette.textSecondary,
    tabIconSelected: palette.accent,
    ...palette, // Disponibiliza todas as cores
  },
  dark: {
    // Pode preencher isto depois se quiser dark mode
    text: '#FFFFFF',
    background: '#111827',
    tint: '#FFFFFF',
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FFFFFF',
    primary: '#FFFFFF',
    accent: '#3B82F6',
    card: '#1F2937',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#EF4444',
  },
};
