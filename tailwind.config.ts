
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Professional color palette inspired by your logo
				professional: {
					blue: 'hsl(217, 89%, 61%)',
					'blue-light': 'hsl(217, 89%, 95%)',
					'blue-dark': 'hsl(217, 89%, 45%)',
					cyan: 'hsl(197, 71%, 52%)',
					'cyan-light': 'hsl(197, 71%, 95%)',
					'cyan-dark': 'hsl(197, 71%, 40%)',
					navy: 'hsl(213, 31%, 14%)',
					'navy-light': 'hsl(213, 31%, 85%)',
					'navy-dark': 'hsl(213, 31%, 8%)',
					slate: 'hsl(214, 32%, 91%)',
					'slate-light': 'hsl(214, 32%, 96%)',
					'slate-dark': 'hsl(214, 32%, 45%)'
				},
				// Enhanced Jira-inspired colors with professional touch
				jira: {
					blue: 'hsl(var(--jira-blue))',
					'blue-light': 'hsl(var(--jira-blue-light))',
					green: 'hsl(var(--jira-green))',
					'green-light': 'hsl(var(--jira-green-light))',
					orange: 'hsl(var(--jira-orange))',
					'orange-light': 'hsl(var(--jira-orange-light))',
					red: 'hsl(var(--jira-red))',
					'red-light': 'hsl(var(--jira-red-light))',
					purple: 'hsl(var(--jira-purple))',
					'purple-light': 'hsl(var(--jira-purple-light))',
					gray: 'hsl(var(--jira-gray))',
					'gray-light': 'hsl(var(--jira-gray-light))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'professional-slide-in': {
					'0%': {
						opacity: '0',
						transform: 'translateX(-20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'professional-scale-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'professional-fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'professional-slide-in': 'professional-slide-in 0.3s ease-out',
				'professional-scale-in': 'professional-scale-in 0.2s ease-out',
				'professional-fade-in': 'professional-fade-in 0.3s ease-out'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			boxShadow: {
				'professional': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'professional-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'professional-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			},
			backdropBlur: {
				'professional': '16px',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
