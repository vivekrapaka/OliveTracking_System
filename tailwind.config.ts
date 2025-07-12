
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
					// Main brand colors from logo
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
					'slate-dark': 'hsl(214, 32%, 45%)',
					
					// Extended professional palette
					green: 'hsl(145, 63%, 49%)',
					'green-light': 'hsl(145, 63%, 95%)',
					'green-dark': 'hsl(145, 63%, 35%)',
					orange: 'hsl(24, 100%, 50%)',
					'orange-light': 'hsl(24, 100%, 95%)',
					'orange-dark': 'hsl(24, 100%, 40%)',
					red: 'hsl(0, 84%, 60%)',
					'red-light': 'hsl(0, 84%, 95%)',
					'red-dark': 'hsl(0, 84%, 45%)',
					purple: 'hsl(259, 100%, 65%)',
					'purple-light': 'hsl(259, 100%, 95%)',
					'purple-dark': 'hsl(259, 100%, 50%)',
					gray: 'hsl(210, 11%, 71%)',
					'gray-light': 'hsl(210, 11%, 96%)',
					'gray-dark': 'hsl(210, 11%, 55%)',
					yellow: 'hsl(45, 100%, 60%)',
					'yellow-light': 'hsl(45, 100%, 95%)',
					'yellow-dark': 'hsl(45, 100%, 45%)',
					indigo: 'hsl(243, 75%, 59%)',
					'indigo-light': 'hsl(243, 75%, 95%)',
					'indigo-dark': 'hsl(243, 75%, 44%)'
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
				},
				'professional-shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'professional-slide-in': 'professional-slide-in 0.3s ease-out',
				'professional-scale-in': 'professional-scale-in 0.2s ease-out',
				'professional-fade-in': 'professional-fade-in 0.3s ease-out',
				'professional-shimmer': 'professional-shimmer 2s linear infinite'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'professional': ['Inter', 'system-ui', '-apple-system', 'sans-serif']
			},
			boxShadow: {
				'professional': '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)',
				'professional-lg': '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
				'professional-xl': '0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04)',
				'professional-glow': '0 0 20px rgba(59, 130, 246, 0.15)',
				'professional-inner': 'inset 0 2px 4px 0 rgba(59, 130, 246, 0.06)'
			},
			backdropBlur: {
				'professional': '16px',
				'professional-lg': '24px'
			},
			backgroundImage: {
				'professional-gradient': 'linear-gradient(135deg, hsl(217, 89%, 61%) 0%, hsl(197, 71%, 52%) 100%)',
				'professional-gradient-dark': 'linear-gradient(135deg, hsl(217, 89%, 45%) 0%, hsl(197, 71%, 40%) 100%)',
				'professional-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
