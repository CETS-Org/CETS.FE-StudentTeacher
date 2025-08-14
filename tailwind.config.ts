import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            // Custom color palette based on design tokens
            colors: {
                // Primary colors
                primary: {
                    50: 'var(--color-primary-50)',
                    100: 'var(--color-primary-100)',
                    200: 'var(--color-primary-200)',
                    300: 'var(--color-primary-300)',
                    400: 'var(--color-primary-400)',
                    500: 'var(--color-primary-500)',
                    600: 'var(--color-primary-600)',
                    700: 'var(--color-primary-700)',
                    800: 'var(--color-primary-800)',
                    900: 'var(--color-primary-900)',
                    DEFAULT: 'var(--color-primary-500)',
                },

                // Success colors
                success: {
                    50: 'var(--color-success-50)',
                    100: 'var(--color-success-100)',
                    200: 'var(--color-success-200)',
                    300: 'var(--color-success-300)',
                    400: 'var(--color-success-400)',
                    500: 'var(--color-success-500)',
                    600: 'var(--color-success-600)',
                    700: 'var(--color-success-700)',
                    800: 'var(--color-success-800)',
                    900: 'var(--color-success-900)',
                    DEFAULT: 'var(--color-success-500)',
                },

                // Warning colors
                warning: {
                    50: 'var(--color-warning-50)',
                    100: 'var(--color-warning-100)',
                    200: 'var(--color-warning-200)',
                    300: 'var(--color-warning-300)',
                    400: 'var(--color-warning-400)',
                    500: 'var(--color-warning-500)',
                    600: 'var(--color-warning-600)',
                    700: 'var(--color-warning-700)',
                    800: 'var(--color-warning-800)',
                    900: 'var(--color-warning-900)',
                    DEFAULT: 'var(--color-warning-500)',
                },

                // Error colors
                error: {
                    50: 'var(--color-error-50)',
                    100: 'var(--color-error-100)',
                    200: 'var(--color-error-200)',
                    300: 'var(--color-error-300)',
                    400: 'var(--color-error-400)',
                    500: 'var(--color-error-500)',
                    600: 'var(--color-error-600)',
                    700: 'var(--color-error-700)',
                    800: 'var(--color-error-800)',
                    900: 'var(--color-error-900)',
                    DEFAULT: 'var(--color-error-500)',
                },

                // Info colors
                info: {
                    50: 'var(--color-info-50)',
                    100: 'var(--color-info-100)',
                    200: 'var(--color-info-200)',
                    300: 'var(--color-info-300)',
                    400: 'var(--color-info-400)',
                    500: 'var(--color-info-500)',
                    600: 'var(--color-info-600)',
                    700: 'var(--color-info-700)',
                    800: 'var(--color-info-800)',
                    900: 'var(--color-info-900)',
                    DEFAULT: 'var(--color-info-500)',
                },

                // Gray colors
                gray: {
                    50: 'var(--color-gray-50)',
                    100: 'var(--color-gray-100)',
                    200: 'var(--color-gray-200)',
                    300: 'var(--color-gray-300)',
                    400: 'var(--color-gray-400)',
                    500: 'var(--color-gray-500)',
                    600: 'var(--color-gray-600)',
                    700: 'var(--color-gray-700)',
                    800: 'var(--color-gray-800)',
                    900: 'var(--color-gray-900)',
                },

                // Semantic background colors
                'bg-primary': 'var(--color-bg-primary)',
                'bg-secondary': 'var(--color-bg-secondary)',
                'bg-tertiary': 'var(--color-bg-tertiary)',

                // Semantic text colors
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                'text-tertiary': 'var(--color-text-tertiary)',
                'text-inverse': 'var(--color-text-inverse)',

                // Standard UI colors for components
                background: 'var(--color-bg-primary)',
                foreground: 'var(--color-text-primary)',
                border: 'var(--color-gray-200)',
                input: 'var(--color-bg-primary)',
                ring: 'var(--color-primary-500)',
                accent: {
                    DEFAULT: 'var(--color-gray-100)',
                    foreground: 'var(--color-text-primary)',
                },
                muted: {
                    DEFAULT: 'var(--color-gray-100)',
                    foreground: 'var(--color-text-secondary)',
                },
                destructive: {
                    DEFAULT: 'var(--color-error-500)',
                    foreground: 'white',
                },
                card: {
                    DEFAULT: 'var(--color-bg-primary)',
                    foreground: 'var(--color-text-primary)',
                },
                popover: {
                    DEFAULT: 'var(--color-bg-primary)',
                    foreground: 'var(--color-text-primary)',
                },
            },

            // Custom spacing based on design tokens
            spacing: {
                'xs': 'var(--spacing-xs)',
                'sm': 'var(--spacing-sm)',
                'md': 'var(--spacing-md)',
                'lg': 'var(--spacing-lg)',
                'xl': 'var(--spacing-xl)',
                '2xl': 'var(--spacing-2xl)',
                '3xl': 'var(--spacing-3xl)',
                '4xl': 'var(--spacing-4xl)',
                '5xl': 'var(--spacing-5xl)',
                '13': '3.25rem', // 52px for large button
            },

            // Custom border radius
            borderRadius: {
                'none': 'var(--radius-none)',
                'sm': 'var(--radius-sm)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-lg)',
                'xl': 'var(--radius-xl)',
                '2xl': 'var(--radius-2xl)',
                'full': 'var(--radius-full)',
            },

            // Custom font families
            fontFamily: {
                sans: 'var(--font-family-sans)',
                mono: 'var(--font-family-mono)',
            },

            // Custom font sizes with line heights
            fontSize: {
                'display': ['var(--font-size-display)', { lineHeight: 'var(--line-height-display)', fontWeight: 'var(--font-weight-display)' }],
                'h1': ['var(--font-size-h1)', { lineHeight: 'var(--line-height-h1)', fontWeight: 'var(--font-weight-h1)' }],
                'h2': ['var(--font-size-h2)', { lineHeight: 'var(--line-height-h2)', fontWeight: 'var(--font-weight-h2)' }],
                'h3': ['var(--font-size-h3)', { lineHeight: 'var(--line-height-h3)', fontWeight: 'var(--font-weight-h3)' }],
                'h4': ['var(--font-size-h4)', { lineHeight: 'var(--line-height-h4)', fontWeight: 'var(--font-weight-h4)' }],
                'h5': ['var(--font-size-h5)', { lineHeight: 'var(--line-height-h5)', fontWeight: 'var(--font-weight-h5)' }],
                'h6': ['var(--font-size-h6)', { lineHeight: 'var(--line-height-h6)', fontWeight: 'var(--font-weight-h6)' }],
                'body-large': ['var(--font-size-body-large)', { lineHeight: 'var(--line-height-body-large)', fontWeight: 'var(--font-weight-body-large)' }],
                'body': ['var(--font-size-body)', { lineHeight: 'var(--line-height-body)', fontWeight: 'var(--font-weight-body)' }],
                'body-small': ['var(--font-size-body-small)', { lineHeight: 'var(--line-height-body-small)', fontWeight: 'var(--font-weight-body-small)' }],
                'caption': ['var(--font-size-caption)', { lineHeight: 'var(--line-height-caption)', fontWeight: 'var(--font-weight-caption)' }],
            },

            // Custom box shadows
            boxShadow: {
                'sm': 'var(--shadow-sm)',
                'md': 'var(--shadow-md)',
                'lg': 'var(--shadow-lg)',
                'xl': 'var(--shadow-xl)',
                '2xl': 'var(--shadow-2xl)',
                'inner': 'var(--shadow-inner)',
            },

            // Custom ring colors for focus states
            ringColor: {
                'ring': 'var(--color-primary-500)',
            },

            // Custom z-index values
            zIndex: {
                'hide': 'var(--z-hide)',
                'auto': 'var(--z-auto)',
                'base': 'var(--z-base)',
                'docked': 'var(--z-docked)',
                'dropdown': 'var(--z-dropdown)',
                'sticky': 'var(--z-sticky)',
                'banner': 'var(--z-banner)',
                'overlay': 'var(--z-overlay)',
                'modal': 'var(--z-modal)',
                'popover': 'var(--z-popover)',
                'skip-link': 'var(--z-skip-link)',
                'toast': 'var(--z-toast)',
                'tooltip': 'var(--z-tooltip)',
            },

            // Custom animation durations
            transitionDuration: {
                'fast': 'var(--duration-fast)',
                'normal': 'var(--duration-normal)',
                'slow': 'var(--duration-slow)',
            },

            // Custom animation timing functions
            transitionTimingFunction: {
                'linear': 'var(--easing-linear)',
                'ease': 'var(--easing-ease)',
                'ease-in': 'var(--easing-ease-in)',
                'ease-out': 'var(--easing-ease-out)',
                'ease-in-out': 'var(--easing-ease-in-out)',
                'bounce': 'var(--easing-bounce)',
            },

            // Custom breakpoints
            screens: {
                'mobile': '320px',
                'tablet': '768px',
                'desktop': '1024px',
                'wide': '1280px',
            },
        },
    },
    plugins: [],
};

export default config;