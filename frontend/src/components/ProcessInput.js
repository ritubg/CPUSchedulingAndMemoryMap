import React, { useState } from 'react';

const ProcessInput = ({ onAddProcess, algorithm }) => {
  const [pid, setPid] = useState('');
  const [numPages, setNumPages] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [timeQuantum, setTimeQuantum] = useState(''); // For RR only

  const handleSubmit = (e) => {
    e.preventDefault();
    const process = { pid, numPages: parseInt(numPages), burstTime: parseInt(burstTime) };
    if (algorithm === 'rr' && timeQuantum) {
      process.timeQuantum = parseInt(timeQuantum);
    }
    onAddProcess(process);
    setPid('');
    setNumPages('');
    setBurstTime('');
    setTimeQuantum('');
  };

  const inputStyle = {
    width: "250px",
    height: "50px",
    padding: "10px",
    fontSize: "1.2rem",
    borderRadius: "20px",
    border: "3px solid #333",
    marginBottom: "25px"
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" style={inputStyle} placeholder="Process ID" value={pid} onChange={(e) => setPid(e.target.value)} />
      <input type="number" style={inputStyle} placeholder="Number of Pages" value={numPages} onChange={(e) => setNumPages(e.target.value)} />
      <input type="number" style={inputStyle} placeholder="Burst Time" value={burstTime} onChange={(e) => setBurstTime(e.target.value)} />
      {algorithm === 'rr' && (
        <input
          type="number"
          style={inputStyle}
          placeholder="Time Quantum"
          value={timeQuantum}
          onChange={(e) => setTimeQuantum(e.target.value)}
        />
      )}
      <button type="submit" style={{ width: "200px", height: "50px", fontSize: "1.2rem", marginTop: "10px" }}>Add Process</button>
    </form>
  );
};

export default ProcessInput;