// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        syne:    ['Sora', 'sans-serif'],
        inter:   ['DM Sans', 'sans-serif'],
        jakarta: ['Sora', 'sans-serif'],
        dmSans:  ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Fundos - Light Mode (Cursor/Notion style)
        bg:      '#F7F7F5',       // Off-white quente
        surface: '#FFFFFF',       // Cards brancos
        card:    '#FFFFFF',
        overlay: '#F3F4F6',
        
        // Bordas - Subtis
        border:         '#E5E7EB',
        'border-strong':'#D1D5DB',

        // Acento principal — Emerald
        accent:        '#10B981', 
        'accent-hover':'#059669',
        'accent-muted':'rgba(16,185,129,0.10)',

        // Acento secundário
        accent2: '#64748B',

        // Especial armazém - Amber
        gold:        '#F59E0B',
        'gold-muted':'rgba(245,158,11,0.10)',

        // Textos - Alto Contraste
        'text-primary':   '#111827',   // Quase preto
        'text-secondary': '#6B7280',   // Cinza médio
        muted:            '#9CA3AF',   // Cinza claro

        // Semânticas
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#0EA5E9',
      },
      backgroundImage: {
        'ambient-glow':  'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.05) 0%, transparent 70%)',
        'gradient-text': 'linear-gradient(135deg, #111827 0%, #4B5563 100%)',
        'gradient-brand':'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      boxShadow: {
        'glow':      '0 0 40px rgba(16,185,129,0.10)',
        'glow-sm':   '0 0 20px rgba(16,185,129,0.05)',
        'card':      '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'card-hover':'0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)',
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '16px',
        '4xl': '24px',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
