/** @type {import('tailwindcss').Config} */
export default {
  content: {
    files: ["./index.html",
      "./pages/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./app/**/*.{ts,tsx}",
      "./src/**/*.{ts,tsx}"]
  },
  theme: {
    extend: {},
  },
  plugins: [],
}