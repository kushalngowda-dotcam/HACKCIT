/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a10',
        card: '#0e1524',
        border: '#1e293b',
        primary: {
          DEFAULT: '#00f2fe',
          foreground: '#070a10',
        },
        danger: {
          DEFAULT: '#ff3838',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#ff9f43',
          foreground: '#070a10',
        },
        success: {
          DEFAULT: '#00d26a',
          foreground: '#070a10',
        },
        info: {
          DEFAULT: '#38ef7d',
          foreground: '#070a10',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
        'glow-red': 'glowRed 1.5s ease-in-out infinite alternate',
        'radar-sweep': 'radarSweep 4s linear infinite',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(0, 242, 254, 0.3), 0 0 10px rgba(0, 242, 254, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 242, 254, 0.8), 0 0 30px rgba(0, 242, 254, 0.6)' },
        },
        glowRed: {
          '0%': { boxShadow: '0 0 5px rgba(255, 56, 56, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(255, 56, 56, 0.9), 0 0 35px rgba(255, 56, 56, 0.7)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
