const express = require('express');
const cors = require('cors');
const fcfsRoutes = require('./routes/fcfsRoutes');
const sjfRoutes = require('./routes/sjfRoutes');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// API Routes 
app.use('/fcfs', fcfsRoutes);
app.use('/sjf', sjfRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
