
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
                // Custom app colors
                app: {
                    'blue': '#0056b3',
                    'light-blue': '#4e8cc2',
                    'dark-blue': '#003b7a',
                    'gray': '#f5f7fa',
                    'dark-gray': '#333333'
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
                'pulse-light': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-light': 'pulse-light 2s ease-in-out infinite'
			},
            // Add safe area utilities for mobile devices
            padding: {
                'safe-area': 'env(safe-area-inset-bottom, 0px)',
            }
		}
	},
	plugins: [
        require("tailwindcss-animate"),
        function({ addUtilities }) {
            const newUtilities = {
                '.pt-safe-area': {
                    paddingTop: 'env(safe-area-inset-top, 0px)'
                },
                '.pr-safe-area': {
                    paddingRight: 'env(safe-area-inset-right, 0px)'
                },
                '.pb-safe-area': {
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                },
                '.pl-safe-area': {
                    paddingLeft: 'env(safe-area-inset-left, 0px)'
                },
                '.px-safe-area': {
                    paddingLeft: 'env(safe-area-inset-left, 0px)',
                    paddingRight: 'env(safe-area-inset-right, 0px)'
                },
                '.py-safe-area': {
                    paddingTop: 'env(safe-area-inset-top, 0px)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }
            };
            addUtilities(newUtilities);
        }
    ],
} satisfies Config;
