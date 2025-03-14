/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-hover': '#4f46e5',
        surface: {
          1: 'rgba(17, 17, 17, 0.95)',
          2: 'rgba(23, 23, 35, 0.9)',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b'
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5'
        },
        status: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b'
        }
      },
      spacing: {
        navbar: '70px',
        container: '1200px',
        108: '432px'
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px'
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
        md: '0 4px 16px rgba(0, 0, 0, 0.2)',
        lg: '0 8px 32px rgba(0, 0, 0, 0.25)'
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
        'slide-out-right': 'slideOutRight 0.3s ease-out forwards',
        'fade-in': 'fadeIn 200ms ease-out',
        'fade-out': 'fadeOut 200ms ease-out',
        'progress': 'progress 3s linear',
        'sparkle-fade': 'sparkle-fade 1000ms ease-in-out forwards',
        'lightning': 'lightning 300ms ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flame': 'flame 2s ease-in-out infinite alternate',
        'mist-float': 'mist-float 2s ease-out forwards'
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        'sparkle-fade': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1) rotate(90deg)', opacity: '0.7' },
          '100%': { transform: 'scale(0) rotate(180deg)', opacity: '0' }
        },
        'lightning': {
          '0%': { 
            transform: 'translate(-50%, -50%) scale(0) rotate(var(--rotation))',
            opacity: '0' 
          },
          '20%': { 
            transform: 'translate(-50%, -50%) scale(1.2) rotate(var(--rotation))',
            opacity: '0.9' 
          },
          '100%': { 
            transform: 'translate(-50%, -50%) scale(0) rotate(var(--rotation))',
            opacity: '0' 
          }
        },
        'pulse-glow': {
          '0%': { opacity: 0.4 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0.4 }
        },
        flame: {
          '0%': {
            transform: 'translateY(0) scale(1) rotate(-2deg)',
            filter: 'brightness(1)',
          },
          '50%': {
            transform: 'translateY(-2px) scale(1.01) rotate(1deg)',
            filter: 'brightness(1.1)',
          },
          '100%': {
            transform: 'translateY(-1px) scale(0.99) rotate(-1deg)',
            filter: 'brightness(0.9)',
          },
        },
        'mist-float': {
          '0%': {
            transform: 'translateX(0) scale(1)',
            opacity: 'var(--opacity)',
          },
          '100%': {
            transform: 'translateX(150px) scale(1.5)',
            opacity: '0',
          }
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'bg-gradient': 'radial-gradient(circle at top right, #1e1e2f 0%, #0f0f1a 100%)'
      },
      minHeight: {
        'screen': 'calc(100vh - 70px)',
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('tailwind-scrollbar-hide')
  ],
}