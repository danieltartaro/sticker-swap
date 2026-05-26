/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'fifa-red':    '#D7232A',
        'fifa-violet': '#9B5BD2',
        'fifa-blue':   '#1E40C8',
        'fifa-green':  '#2BAA4F',
        'fifa-orange': '#E55B2A',
        'fifa-teal':   '#1B8C9E',
        'fifa-yellow': '#FFD600',
        'fifa-forest': '#1A5C3D',
        text: {
          primary: '#F8FAFC',
          muted:   '#94A3B8',
          dim:     '#475569',
        },
        bg: {
          app:  '#0F172A',
          card: '#1E293B',
          pill: '#0F172A',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        mono:    ['var(--font-mono)'],
        sans:    ['var(--font-sans)'],
      },
    },
  },
  plugins: [],
};
