module.exports = {
  content: ["./**/*.{html,js}"], 
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addBase }) {
      addBase({
        'input[type="number"]::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          'margin': '0',
        },
        'input[type="number"]::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          'margin': '0',
        },
        'input[type="number"]': {
          '-moz-appearance': 'textfield',
        },
      });
    },
  ],
};