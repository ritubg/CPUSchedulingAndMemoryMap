const express = require('express');
const router = express.Router();
const sjfScheduling = require('../controllers/sjfController');

router.post('/', (req, res) => {
  const processes = req.body.processes;
  if (!processes || processes.length === 0) {
    return res.status(400).send({ message: 'No processes provided.' });
  }
  res.send(sjfScheduling(processes));
});

module.exports = router;
