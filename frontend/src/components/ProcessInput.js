import React, { useState } from 'react';

const ProcessInput = ({ onAddProcess }) => {
  const [pid, setPid] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [burstTime, setBurstTime] = useState('');

  const handleAddProcess = () => {
    const process = {
      pid: pid || Math.floor(Math.random() * 1000),  // Generate random PID if not provided
      arrivalTime: parseInt(arrivalTime),
      burstTime: parseInt(burstTime),
    };

    onAddProcess(process);  // Pass the process data to the parent component
    setPid('');
    setArrivalTime('');
    setBurstTime('');
  };

  return (
    <div style={{ marginLeft: '25px' }}>
      <div>
        <label style={{ fontSize: '18px', marginRight: '10px' }}>PID:</label>
        <input
          type="text"
          value={pid}
          onChange={(e) => setPid(e.target.value)}
          style={{ fontSize: '18px', padding: '8px', width: '300px' }}
        />
      </div>
      <div>
        <label style={{ fontSize: '18px', marginRight: '10px' }}>Arrival Time:</label>
        <input
          type="number"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          style={{ fontSize: '18px', padding: '8px', width: '300px' }}
        />
      </div>
      <div>
        <label style={{ fontSize: '18px', marginRight: '10px' }}>Burst Time:</label>
        <input
          type="number"
          value={burstTime}
          onChange={(e) => setBurstTime(e.target.value)}
          style={{ fontSize: '18px', padding: '8px', width: '300px' }}
        />
      </div>
      <button
        onClick={handleAddProcess}
        style={{
          fontSize: '18px',
          padding: '10px 20px',
          marginTop: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Add Process
      </button>
    </div>
  );
};

export default ProcessInput;
