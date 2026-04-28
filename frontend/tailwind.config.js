/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF8F5',
        surface: '#f4fbf8',
        ink: '#161d1b',
        muted: '#585e6f',
        primary: '#006b5f',
        accent: '#14B8A6',
        error: '#ba1a1a',
        success: '#10B981',
        warning: '#F59E0B',
        border: '#e3eae7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      spacing: {
        gutter: '1.5rem',
        page: '2rem',
      },
    },
  },
  plugins: [],
};
