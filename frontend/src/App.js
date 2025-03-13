import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import FCFS from './pages/FCFS';
import SJF from './pages/SJF';
import ProcessInput from './components/ProcessInput';
import ProcessQueue from './components/ProcessQueue';
import ReadyQueue from './components/ReadyQueue';
import RunningProcess from './components/RunningProcess'; // Import RunningProcess Component
import TerminatedProcess from './components/TerminatedProcess'; // Import TerminatedProcess Component
import GanttChart from './components/GanttChart';
import CPUUtilization from './components/CpuUtilization';
import { getFcfsData } from './services/api';

const App = () => {
  const [processes, setProcesses] = useState([]);
  const [ganttChart, setGanttChart] = useState([]);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [readyQueue, setReadyQueue] = useState([]);
  const [runningProcess, setRunningProcess] = useState(null);
  const [terminatedProcesses, setTerminatedProcesses] = useState([]);

  const handleAddProcess = (process) => {
    const arrivalTime = Date.now();
    const newProcess = { ...process, arrivalTime };
    setProcesses([newProcess, ...processes]);
  };

  const handleSubmit = async () => {
    try {
      const data = await getFcfsData(processes);
      setGanttChart(data.ganttChart || []);
      setCpuUtilization(data.cpuUtilization || 0);
    } catch (error) {
      console.error('Error fetching FCFS data:', error);
    }
  };

  useEffect(() => {
    const moveToReadyQueue = () => {
      if (processes.length > 0) {
        const processToMove = processes[processes.length - 1];
        setProcesses((prevProcesses) => prevProcesses.slice(0, -1));
        setReadyQueue((prevReadyQueue) => [processToMove, ...prevReadyQueue]);
      }
    };

    const getRandomInterval = () => Math.floor(Math.random() * 10) + 1; // Random interval between 1 and 10 seconds

    const interval = setInterval(moveToReadyQueue, getRandomInterval() * 1000); // Convert to milliseconds
    return () => clearInterval(interval);
  }, [processes]);

  useEffect(() => {
    if (!runningProcess && readyQueue.length > 0) {
      const nextProcess = readyQueue[0];
      setReadyQueue((prevReadyQueue) => prevReadyQueue.slice(1));
      setRunningProcess({ ...nextProcess, state: 'ready' });

      setTimeout(() => {
        setRunningProcess({ ...nextProcess, state: 'running' });
      }, 5000);
    }
  }, [readyQueue, runningProcess]);

  useEffect(() => {
    if (runningProcess && runningProcess.state === 'running') {
      const timeout = setTimeout(() => {
        setTerminatedProcesses((prevTerminatedProcesses) => [
          ...prevTerminatedProcesses,
          runningProcess,
        ]);
        setRunningProcess(null);
      }, runningProcess.burstTime * 1000);

      return () => clearTimeout(timeout);
    }
  }, [runningProcess]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/fcfs"
            element={
              <div>
      <h1 style={{ marginLeft: '25px' }}>FCFS Scheduling Algorithm</h1> {/* Apply margin to h1 */}
      <ProcessInput onAddProcess={handleAddProcess} />
                <div className="queues-container">
                  <div className="queue">
                    <h2>Process Queue</h2>
                    <ProcessQueue processes={processes} />
                  </div>

                  <div className="queue">
                    <h2>Ready Queue</h2>
                    <ReadyQueue readyQueue={readyQueue} />
                  </div>

                  <RunningProcess runningProcess={runningProcess} />

                  <div className="queue">
                    <h2>Terminated Processes</h2>
                    <div className="terminated-process-list">
                      {terminatedProcesses.map((terminatedProcess) => (
                        <TerminatedProcess
                          key={terminatedProcess.arrivalTime} // Use arrivalTime or process.id for unique key
                          terminatedProcess={terminatedProcess} // Correct prop name
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/sjf" element={<SJF />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
