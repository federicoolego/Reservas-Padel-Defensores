/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de Defensores (los nombres se mantienen para no tocar los componentes)
        noche: '#3A0907',     // bordó oscuro: encabezados y textos
        escudo: '#8E1B14',    // bordó del escudo: botones y acentos
        pelota: '#D2DA1F',    // amarillo de la pelota
        rojo: '#D7262E',      // rojo -> turno reservado
        cesped: '#1F7A3A',    // verde -> turno libre
        niebla: '#F7F1F0',
        tinta: '#6B5654',
        linea: '#E3D3D1',
      },
      fontFamily: {
        tablero: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
