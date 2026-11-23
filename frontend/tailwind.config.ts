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
        /** Brand blue (matches the logo badge). Was emerald green. */
        brand: {
          50: '#EBF1FB',
          100: '#D4E1F6',
          200: '#A9C3EC',
          300: '#77A0DF',
          400: '#4A80D4',
          500: '#1D5BBF',
          600: '#1650A8',
          700: '#124290',
          800: '#0F3675',
          900: '#0B2959',
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
          value: '#1D5BBF',
          invested: '#C9832F',
          target: '#4F6081',
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
          'radial-gradient(120% 80% at 85% 0%, rgba(22,80,168,0.32) 0%, rgba(16,29,53,0) 55%), radial-gradient(90% 70% at 0% 100%, rgba(199,166,106,0.14) 0%, rgba(16,29,53,0) 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
