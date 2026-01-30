import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-left': {
          'from': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'fade-in-right': {
            'from': {
                opacity: '0',
                transform: 'translateX(20px)',
            },
            'to': {
                opacity: '1',
                transform: 'translateX(0)',
            },
        },
        'zoom-in': {
            'from': {
                opacity: '0',
                transform: 'scale(0.95)',
            },
            'to': {
                opacity: '1',
                transform: 'scale(1)',
            },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 8px hsl(var(--accent) / 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px hsl(var(--accent) / 1)',
          },
        },
        'border-glow': {
           '0%': {
                boxShadow: '0 0 8px hsl(var(--primary) / 0.3), 0 0 15px hsl(var(--primary) / 0.2)',
            },
            '50%': {
                boxShadow: '0 0 15px hsl(var(--primary) / 0.6), 0 0 25px hsl(var(--primary) / 0.4)',
            },
            '100%': {
                boxShadow: '0 0 8px hsl(var(--primary) / 0.3), 0 0 15px hsl(var(--primary) / 0.2)',
            },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'hero-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.5' },
        },
        'node-pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: '1' },
            '50%': { transform: 'scale(1.2)', opacity: '0.8' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in-left': 'fade-in-left 0.5s ease-out forwards',
        'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
        'zoom-in': 'zoom-in 0.5s ease-out forwards',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'border-glow': 'border-glow 4s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'hero-glow': 'hero-glow 8s ease-in-out infinite',
        'node-pulse': 'node-pulse 2.5s ease-in-out infinite',
      },
      backgroundSize: {
        '400%': '400% 400%',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
