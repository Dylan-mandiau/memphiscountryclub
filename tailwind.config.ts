import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/globals/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
        border: 'var(--color-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
        },
        'accent-2': {
          DEFAULT: 'var(--color-accent-2)',
          light: 'var(--color-accent-2-light)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        h1: ['2.75rem', { lineHeight: '1.15', fontWeight: '500' }],
        h2: ['1.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        h3: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.55', fontWeight: '400' }],
        xs: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      borderRadius: {
        pill: '9999px',
        soft: '14px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hero: 'var(--shadow-hero)',
        soft: 'var(--shadow-soft)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}

export default config
