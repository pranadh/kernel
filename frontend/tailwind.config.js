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
        container: '1200px'
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
        'fade-out': 'fadeOut 200ms ease-out'
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
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'bg-gradient': 'radial-gradient(circle at top right, #1e1e2f 0%, #0f0f1a 100%)'
      }
    },
  },
  plugins: [],
}