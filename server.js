const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static('.'));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle other routes
app.get('/random', (req, res) => {
  res.sendFile(path.join(__dirname, 'random.html'));
});

app.get('/date', (req, res) => {
  res.sendFile(path.join(__dirname, 'date.html'));
});

app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, 'result.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 