// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Display: pesada, moderna
        display: ['Sora', 'sans-serif'],
        // Body: limpeza premium
        body: ['DM Sans', 'sans-serif'],
        // Aliases backward-compat — não quebra usos existentes
        syne:    ['Sora', 'sans-serif'],
        inter:   ['DM Sans', 'sans-serif'],
        jakarta: ['Sora', 'sans-serif'],
        dmSans:  ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Fundos - Neutral Premium Dark
        bg:      '#050505',
        surface: '#0A0A0A',
        card:    '#0F0F0F',
        overlay: '#141414',
        
        // Bordas - Sharper
        border:         'rgba(255,255,255,0.05)',
        'border-strong':'rgba(255,255,255,0.10)',

        // Acento principal — Cyan/Emerald (Zentra style)
        accent:        '#10B981', 
        'accent-hover':'#059669',
        'accent-muted':'rgba(16,185,129,0.10)',

        // Acento secundário — Steel
        accent2: '#94A3B8',

        // Especial armazém - Amber
        gold:        '#F59E0B',
        'gold-muted':'rgba(245,158,11,0.10)',

        // Textos
        'text-primary':   '#FFFFFF',
        'text-secondary': '#A1A1AA',
        muted:            '#52525B',

        // Semânticas
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#0EA5E9',
      },
      backgroundImage: {
        'ambient-glow':  'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        'gradient-text': 'linear-gradient(135deg, #FFFFFF 0%, #94A3B8 100%)',
        'gradient-brand':'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
      },
      boxShadow: {
        'glow':      '0 0 40px rgba(16,185,129,0.15)',
        'glow-sm':   '0 0 20px rgba(16,185,129,0.10)',
        'card':      '0 4px 24px rgba(0,0,0,0.60)',
        'card-hover':'0 8px 40px rgba(0,0,0,0.80)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
