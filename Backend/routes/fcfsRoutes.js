const express = require('express');
const router = express.Router();
const fcfsScheduling = require('../controllers/fcfsController');

router.post('/', (req, res) => {
  const processes = req.body.processes;
  if (!processes || processes.length === 0) {
    return res.status(400).send({ message: 'No processes provided.' });
  }
  res.send(fcfsScheduling(processes));
});

module.exports = router;
