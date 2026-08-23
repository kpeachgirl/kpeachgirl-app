import type { Config } from 'tailwindcss'

/* Global type scale. Bumping this nudges every named text-* utility together;
   the raw px sizes in globals.css and inline styles are scaled to match.
   The public site carries the same 1.265x factor; the admin dashboard uses
   no named text-* utilities, so it keeps its own smaller px sizes. */
const TEXT_SCALE = 1.265

const rem = (n: number) => `${+(n * TEXT_SCALE).toFixed(4)}rem`
const step = (size: number, leading: number): [string, string] => [rem(size), rem(leading)]

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
      fontSize: {
        xs:   step(0.75,  1),
        sm:   step(0.875, 1.25),
        base: step(1,     1.5),
        lg:   step(1.125, 1.75),
        xl:   step(1.25,  1.75),
        '2xl': step(1.5,   2),
        '3xl': step(1.875, 2.25),
        '4xl': step(2.25,  2.5),
        '5xl': [rem(3),    '1'],
        '6xl': [rem(3.75), '1'],
        '7xl': [rem(4.5),  '1'],
        '8xl': [rem(6),    '1'],
        '9xl': [rem(8),    '1'],
        /* Pinned to the admin scale (1.1x) so the login page keeps the same
           size as the rest of the dashboard instead of following TEXT_SCALE.
           Literal values on purpose — do not derive these from TEXT_SCALE. */
        'admin-sm':   ['0.9625rem', '1.375rem'],
        'admin-base': ['1.1rem',    '1.65rem'],
      },
    },
  },
  plugins: [],
}

export default config
