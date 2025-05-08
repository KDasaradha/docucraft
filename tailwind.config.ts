import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
      typography: (theme: (path: string) => string) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'hsl(var(--foreground))',
            '--tw-prose-headings': 'hsl(var(--foreground))',
            '--tw-prose-lead': 'hsl(var(--foreground))',
            '--tw-prose-links': 'hsl(var(--primary))',
            '--tw-prose-bold': 'hsl(var(--foreground))',
            '--tw-prose-counters': 'hsl(var(--muted-foreground))',
            '--tw-prose-bullets': 'hsl(var(--muted-foreground))',
            '--tw-prose-hr': 'hsl(var(--border))',
            '--tw-prose-quotes': 'hsl(var(--foreground))',
            '--tw-prose-quote-borders': 'hsl(var(--primary))',
            '--tw-prose-captions': 'hsl(var(--muted-foreground))',
            '--tw-prose-code': 'hsl(var(--foreground))', 
            '--tw-prose-pre-code': '#f8f8f2', 
            '--tw-prose-pre-bg': '#272822', 
            '--tw-prose-th-borders': 'hsl(var(--border))',
            '--tw-prose-td-borders': 'hsl(var(--border))',
            
             '--tw-prose-invert-body': 'hsl(var(--foreground))',
             '--tw-prose-invert-headings': 'hsl(var(--foreground))',
             '--tw-prose-invert-links': 'hsl(var(--primary))',
             '--tw-prose-invert-bold': 'hsl(var(--foreground))',
             '--tw-prose-invert-counters': 'hsl(var(--muted-foreground))',
             '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground))',
             '--tw-prose-invert-hr': 'hsl(var(--border))',
             '--tw-prose-invert-quotes': 'hsl(var(--foreground))',
             '--tw-prose-invert-quote-borders': 'hsl(var(--primary))',
             '--tw-prose-invert-captions': 'hsl(var(--muted-foreground))',
             '--tw-prose-invert-code': 'hsl(var(--foreground))',
             '--tw-prose-invert-pre-code': '#f8f8f2',
             '--tw-prose-invert-pre-bg': '#272822',
             '--tw-prose-invert-th-borders': 'hsl(var(--border))',
             '--tw-prose-invert-td-borders': 'hsl(var(--border))',
             
             // Customizations for markdown-content specifically
             h1: { fontWeight: '700' },
             a: { textDecoration: 'none'},
             'a:hover': { textDecoration: 'underline',},
             'code::before': { content: '"" !important' }, // Overriding prose defaults
             'code::after': { content: '"" !important' },  // Overriding prose defaults
          },
        },
        sm: { 
          css: {
            fontSize: '0.875rem', 
            p: { marginTop: '0.5em', marginBottom: '0.5em' },
            h1: { fontSize: '1.5rem', marginTop: '1em', marginBottom: '0.5em' }, 
            h2: { fontSize: '1.25rem', marginTop: '0.8em', marginBottom: '0.4em' }, 
            h3: { fontSize: '1.125rem', marginTop: '0.7em', marginBottom: '0.3em' }, 
            pre: { padding: '0.5rem', margin: '0.5em 0', fontSize: '0.8rem' },
            code: { fontSize: '0.8rem' }, // For inline code in prose-sm
             'code::before': { content: '"" !important' },
             'code::after': { content: '"" !important' },
            ul: { marginTop: '0.5em', marginBottom: '0.5em' },
            ol: { marginTop: '0.5em', marginBottom: '0.5em' },
          }
        }
      }),
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
