// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light','dark'],
    darkTheme: 'dark',
  },
}
