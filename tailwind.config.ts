import type { Config } from 'tailwindcss';

/**
 * Design tokens. Brand colours come from the brief; tints/shades are derived
 * so every text/background pairing used in the UI meets WCAG AA.
 *  - Gold (#C7A66A) is decorative on light backgrounds (contrast < 3:1).
 *    Use gold-700 when gold-toned text is needed on a light surface.
 *  - See docs/design-system.md for usage rules.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF1F6',
          100: '#D9DFEA',
          200: '#AEB9CE',
          300: '#7C8BA8',
          400: '#4F6081',
          500: '#2E3E60',
          600: '#22314F',
          700: '#1A2742',
          800: '#142139',
          900: '#101D35',
          950: '#0A1324',
        },
        emerald: {
          50: '#E9F6F0',
          100: '#CDEBDF',
          200: '#9BD6BF',
          300: '#5FBC98',
          400: '#2A9E76',
          500: '#0E8D66',
          600: '#087F5B',
          700: '#06694B',
          800: '#05523B',
          900: '#043D2C',
        },
        gold: {
          100: '#F4ECDD',
          200: '#E6D5B3',
          300: '#D7BE8E',
          400: '#C7A66A',
          500: '#B08E52',
          700: '#7D6232',
        },
        ivory: '#F8F9F6',
        mist: '#E9EDF0',
        ink: {
          DEFAULT: '#101D35',
          muted: '#4A5670',
          subtle: '#646E84',
        },
        chart: {
          value: '#087F5B',
          invested: '#5B7BC0',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5.2vw, 4.25rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 3.6vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.5rem, 2.4vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      maxWidth: { content: '76rem', prose: '42rem' },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(16,29,53,0.04), 0 4px 16px -4px rgba(16,29,53,0.08)',
        lift: '0 2px 4px rgba(16,29,53,0.04), 0 18px 40px -12px rgba(16,29,53,0.18)',
      },
      backgroundImage: {
        'navy-radial':
          'radial-gradient(120% 80% at 85% 0%, rgba(8,127,91,0.28) 0%, rgba(16,29,53,0) 55%), radial-gradient(90% 70% at 0% 100%, rgba(199,166,106,0.14) 0%, rgba(16,29,53,0) 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
