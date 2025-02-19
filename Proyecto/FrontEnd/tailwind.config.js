/ @type {import('tailwindcss').Config} */
export default {
content: [
"./index.html",
"./src//*.{js,ts,jsx,tsx}",
],
theme: {
extend: {
    fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
    },
    colors: {
        'azulOscuro': '#231651',
        'grisOscuro': '#2D2D2D',
        'turquesaClaro': '#D6FFF6',
        'rojoSalmon': '#FF8484',
        'azul': '#2374AB',
        'turquesa': '#4DCCBD',
        'negro': '#1A1A1A',
    }
},
},
plugins: [],
}