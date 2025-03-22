const express = require('express');
const router = express.Router();
const rrScheduling = require('../controllers/rrController');

router.post('/', (req, res) => {
  const processes = req.body.processes;
  const timeQuantum = req.body.timeQuantum || 2; // Default time quantum is 2

  if (!processes || processes.length === 0) {
    return res.status(400).send({ message: 'No processes provided.' });
  }

  const result = rrScheduling(processes, timeQuantum);
  res.send(result);
});

module.exports = router;