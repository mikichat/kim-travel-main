const express = require('express');
const app = express();
const port = 5000; // 백엔드 포트

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});