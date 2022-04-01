const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: {
    enabled: false,
    content: [
      `components/**/*.{vue,js}`,
      `layouts/**/*.vue`,
      `pages/**/*.vue`,
      `plugins/**/*.{js,ts}`,
      `nuxt.config.{js,ts}`,
    ],
    options: {
      safelist: [
        /-fa$/,
        /^fa-/,
      ],
    },
  },
  darkMode: 'class', // or 'media' or 'class'
  mode: 'jit',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      overflow: ['hover', 'focus'],
      typography: {
        '3xl': {
          css: {
            fontSize: '1.875rem',
            h1: {
              fontSize: '4rem',
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'focus', 'hover'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/ui'),
    require('@tailwindcss/line-clamp'),
  ],
};
