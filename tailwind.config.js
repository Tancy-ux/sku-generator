export default {
    darkMode: 'class',   // now .dark in your DOM will flip variants
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [require("daisyui")],
  }
  