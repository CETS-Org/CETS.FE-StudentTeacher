/**
 * Design Tokens for Frontend App
 * Based on the design document specifications
 */

// Color Palette - Using OKLCH color space for better perceptual uniformity
export const colors = {
    // Primary Colors
    primary: {
        50: 'oklch(0.95 0.05 241.966)',
        100: 'oklch(0.9 0.08 241.966)',
        200: 'oklch(0.8 0.12 241.966)',
        300: 'oklch(0.7 0.14 241.966)',
        400: 'oklch(0.6 0.16 241.966)',
        500: 'oklch(0.588 0.158 241.966)', // Primary Blue #2563eb
        600: 'oklch(0.5 0.134 242.749)',   // Primary Blue Dark #1d4ed8
        700: 'oklch(0.45 0.12 242.749)',
        800: 'oklch(0.4 0.1 242.749)',
        900: 'oklch(0.35 0.08 242.749)',
    },

    // Secondary Colors
    success: {
        50: 'oklch(0.95 0.05 149.214)',
        100: 'oklch(0.9 0.08 149.214)',
        200: 'oklch(0.8 0.12 149.214)',
        300: 'oklch(0.7 0.15 149.214)',
        400: 'oklch(0.65 0.17 149.214)',
        500: 'oklch(0.627 0.194 149.214)', // Success Green #16a34a
        600: 'oklch(0.55 0.18 149.214)',
        700: 'oklch(0.5 0.16 149.214)',
        800: 'oklch(0.45 0.14 149.214)',
        900: 'oklch(0.4 0.12 149.214)',
    },

    warning: {
        50: 'oklch(0.95 0.05 81.533)',
        100: 'oklch(0.9 0.08 81.533)',
        200: 'oklch(0.85 0.12 81.533)',
        300: 'oklch(0.8 0.16 81.533)',
        400: 'oklch(0.75 0.2 81.533)',
        500: 'oklch(0.698 0.244 81.533)', // Warning Orange #ea580c
        600: 'oklch(0.65 0.22 81.533)',
        700: 'oklch(0.6 0.2 81.533)',
        800: 'oklch(0.55 0.18 81.533)',
        900: 'oklch(0.5 0.16 81.533)',
    },

    error: {
        50: 'oklch(0.95 0.05 25.331)',
        100: 'oklch(0.9 0.08 25.331)',
        200: 'oklch(0.85 0.12 25.331)',
        300: 'oklch(0.8 0.15 25.331)',
        400: 'oklch(0.7 0.18 25.331)',
        500: 'oklch(0.628 0.207 25.331)', // Error Red #dc2626
        600: 'oklch(0.55 0.18 25.331)',
        700: 'oklch(0.5 0.16 25.331)',
        800: 'oklch(0.45 0.14 25.331)',
        900: 'oklch(0.4 0.12 25.331)',
    },

    info: {
        50: 'oklch(0.95 0.05 241.966)',
        100: 'oklch(0.9 0.08 241.966)',
        200: 'oklch(0.85 0.12 241.966)',
        300: 'oklch(0.8 0.15 241.966)',
        400: 'oklch(0.7 0.18 241.966)',
        500: 'oklch(0.628 0.207 241.966)', // Info Blue #0ea5e9
        600: 'oklch(0.55 0.18 241.966)',
        700: 'oklch(0.5 0.16 241.966)',
        800: 'oklch(0.45 0.14 241.966)',
        900: 'oklch(0.4 0.12 241.966)',
    },

    // Neutral Colors
    gray: {
        50: 'oklch(0.975 0.003 286.052)',
        100: 'oklch(0.95 0.005 286.052)',
        200: 'oklch(0.9 0.01 286.052)',
        300: 'oklch(0.85 0.015 286.052)',
        400: 'oklch(0.7 0.02 286.052)',
        500: 'oklch(0.55 0.025 286.052)',
        600: 'oklch(0.45 0.02 286.052)',
        700: 'oklch(0.35 0.015 286.052)',
        800: 'oklch(0.25 0.01 286.052)',
        900: 'oklch(0.15 0.005 286.052)',
    },
};

// Semantic Colors (Light Theme)
export const semanticColors = {
    light: {
        background: {
            primary: colors.gray[50],
            secondary: 'white',
            tertiary: colors.gray[100],
        },
        text: {
            primary: colors.gray[900],
            secondary: colors.gray[700],
            tertiary: colors.gray[500],
            inverse: 'white',
        },
        border: {
            primary: colors.gray[200],
            secondary: colors.gray[300],
        },
    },
    dark: {
        background: {
            primary: colors.gray[900],
            secondary: colors.gray[800],
            tertiary: colors.gray[700],
        },
        text: {
            primary: 'white',
            secondary: colors.gray[300],
            tertiary: colors.gray[400],
            inverse: colors.gray[900],
        },
        border: {
            primary: colors.gray[700],
            secondary: colors.gray[600],
        },
    },
};

// Typography
export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    },
    fontSize: {
        display: '3rem',    // 48px
        h1: '2.25rem',      // 36px
        h2: '1.875rem',     // 30px
        h3: '1.5rem',       // 24px
        h4: '1.25rem',      // 20px
        h5: '1.125rem',     // 18px
        h6: '1rem',         // 16px
        'body-large': '1.125rem', // 18px
        body: '1rem',       // 16px
        'body-small': '0.875rem', // 14px
        caption: '0.75rem', // 12px
    },
    lineHeight: {
        display: '1.1',
        h1: '1.2',
        h2: '1.3',
        h3: '1.4',
        h4: '1.4',
        h5: '1.5',
        h6: '1.5',
        'body-large': '1.6',
        body: '1.6',
        'body-small': '1.5',
        caption: '1.4',
    },
    fontWeight: {
        display: '700',
        h1: '700',
        h2: '600',
        h3: '600',
        h4: '600',
        h5: '600',
        h6: '600',
        'body-large': '400',
        body: '400',
        'body-small': '400',
        caption: '400',
    },
};

// Spacing
export const spacing = {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
};

// Border Radius
export const borderRadius = {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
};

// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Z-Index
export const zIndex = {
    hide: '-1',
    auto: 'auto',
    base: '0',
    docked: '10',
    dropdown: '1000',
    sticky: '1100',
    banner: '1200',
    overlay: '1300',
    modal: '1400',
    popover: '1500',
    'skip-link': '1600',
    toast: '1700',
    tooltip: '1800',
};

// Animation
export const animation = {
    duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    easing: {
        linear: 'linear',
        ease: 'ease',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
};

// Breakpoints
export const breakpoints = {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
};