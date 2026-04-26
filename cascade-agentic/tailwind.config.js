/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#0a0a0f',
        surface: '#111118',
        surface2: '#1a1a24',
        cyan: '#00d4ff',
        amber: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease infinite',
        'record': 'record-pulse 1.2s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
