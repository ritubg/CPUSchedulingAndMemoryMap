const express = require('express');
const cors = require('cors');
const fcfsRoutes = require('./routes/fcfsRoutes');
const sjfRoutes = require('./routes/sjfRoutes');
const rrRoutes = require('./routes/rrRoutes');

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// API Routes
app.use('/fcfs', fcfsRoutes);
app.use('/sjf', sjfRoutes);
app.use('/rr',rrRoutes);
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});