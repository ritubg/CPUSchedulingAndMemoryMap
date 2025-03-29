import React, { useState, useEffect } from 'react';

const ProcessInput = ({ onAddProcess, algorithm }) => {
  const [pid, setPid] = useState('');
  const [numPages, setNumPages] = useState('');
  const [burstTime, setBurstTime] = useState('');
  const [priority, setPriority] = useState(''); // For Priority algorithm
  const [timeQuantum, setTimeQuantum] = useState('');
  const [timeQuantumSet, setTimeQuantumSet] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If it's RR algorithm and time quantum is provided, but we're submitting a process
    if (algorithm === 'rr') {
      // For the first submission, include the time quantum
      if (!timeQuantumSet && timeQuantum) {
        const process = {
          pid,
          numPages: parseInt(numPages),
          burstTime: parseInt(burstTime),
          timeQuantum: parseInt(timeQuantum) // Send time quantum with first process
        };
        onAddProcess(process);
        setTimeQuantumSet(true);
      } else {
        // For subsequent processes, don't include time quantum
        const process = {
          pid,
          numPages: parseInt(numPages),
          burstTime: parseInt(burstTime)
        };
        onAddProcess(process);
      }
    } else {
      // For non-RR algorithms
      const process = {
        pid,
        numPages: parseInt(numPages),
        burstTime: parseInt(burstTime)
      };
      
      // Add priority for priority algorithm
      if (algorithm === 'priority') {
        process.priority = parseInt(priority);
      }
      
      onAddProcess(process);
    }
    
    // Reset form fields
    setPid('');
    setNumPages('');
    setBurstTime('');
    setPriority('');
    
    // Don't reset timeQuantum once it's set
    // This line isn't necessary since we don't reset timeQuantum anymore
    // if (!timeQuantumSet) {
    //   setTimeQuantum('');
    // }
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
      <input 
        type="text" 
        style={inputStyle} 
        placeholder="Process ID" 
        value={pid} 
        onChange={(e) => setPid(e.target.value)} 
      />
      <input 
        type="number" 
        style={inputStyle} 
        placeholder="Number of Pages" 
        value={numPages} 
        onChange={(e) => setNumPages(e.target.value)} 
      />
      <input 
        type="number" 
        style={inputStyle} 
        placeholder="Burst Time" 
        value={burstTime} 
        onChange={(e) => setBurstTime(e.target.value)} 
      />
      {algorithm === 'rr' && (
        <input
          type="number"
          style={inputStyle}
          placeholder="Time Quantum"
          value={timeQuantum}
          onChange={(e) => setTimeQuantum(e.target.value)}
        />
      )}
      {algorithm === 'priority' && (
        <input
          type="number"
          style={inputStyle}
          placeholder="Priority (Lower number = Higher priority)"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        />
      )}
      <button 
        type="submit" 
        style={{ 
          width: "200px", 
          height: "50px", 
          fontSize: "1.2rem", 
          marginTop: "10px" 
        }}
      >
        Add Process
      </button>
    </form>
  );
};

export default ProcessInput;
