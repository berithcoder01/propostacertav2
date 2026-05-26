// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // Fundos
        bg:      'var(--bg)',
        surface: 'var(--surface)',
        card:    'var(--card)',
        overlay: 'var(--overlay)',

        // Bordas
        border:         'var(--border)',
        'border-strong':'var(--border-strong)',

        // Acento principal — Emerald
        accent:        '#10B981',
        'accent-hover':'#059669',
        'accent-muted':'rgba(16,185,129,0.10)',

        // Acento secundário
        accent2: '#8C735A',

        // Especial armazém - Amber
        gold:        '#F59E0B',
        'gold-muted':'rgba(245,158,11,0.10)',

        // Textos
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        muted:            'var(--muted)',

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
