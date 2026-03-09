import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream:      'var(--cream)',
        warm:       'var(--warm)',
        sand:       'var(--sand)',
        charcoal:   'var(--charcoal)',
        ink:        'var(--ink)',
        muted:      'var(--muted)',
        rose:       'var(--rose)',
        peach:      'var(--peach)',
        sage:       'var(--sage)',
        'card-bg':  'var(--card-bg)',
        'input-bg': 'var(--input-bg)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans:  ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
