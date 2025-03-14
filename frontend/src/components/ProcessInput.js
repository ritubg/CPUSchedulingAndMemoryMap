import React, { useState } from 'react';
const ProcessInput = ({ onAddProcess }) => {
  const [pid, setPid] = useState('');
  const [numPages, setNumPages] = useState('');
  const [burstTime, setBurstTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddProcess({ pid, numPages: parseInt(numPages), burstTime: parseInt(burstTime) });
    setPid('');
    setNumPages('');
    setBurstTime('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Process ID"
        value={pid}
        onChange={(e) => setPid(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of Pages"
        value={numPages}
        onChange={(e) => setNumPages(e.target.value)}
      />
      <input
        type="number"
        placeholder="Burst Time"
        value={burstTime}
        onChange={(e) => setBurstTime(e.target.value)}
      />
      <button type="submit">Add Process</button>
    </form>
  );
};

export default ProcessInput;