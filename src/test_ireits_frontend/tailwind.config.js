/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'poultry-main': '#32302D',
        'poultry-orange': '#FFA500s',
        'poultry-dark': '#4B0082',
        'poultry-pink': '#32302D',
        'white': '#F5F5F5',
        'gold': '#FFD700',
      },
    },
  },
  plugins: [],
}

