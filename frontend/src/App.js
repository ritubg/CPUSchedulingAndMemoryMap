import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import FCFS from './pages/FCFS';
import SJF from './pages/SJF';
import ProcessInput from './components/ProcessInput';
import ProcessQueue from './components/ProcessQueue';
import ReadyQueue from './components/ReadyQueue';
import RunningProcess from './components/RunningProcess';
import TerminatedProcess from './components/TerminatedProcess';
import GanttChart from './components/GanttChart';
import CPUUtilization from './components/CpuUtilization';
import MemoryMap from './components/memorymap'; // Import MemoryMap Component
import { getFcfsData } from './services/api';

const App = () => {
  const [processes, setProcesses] = useState([]);
  const [ganttChart, setGanttChart] = useState([]);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [readyQueue, setReadyQueue] = useState([]);
  const [runningProcess, setRunningProcess] = useState(null);
  const [terminatedProcesses, setTerminatedProcesses] = useState([]);
  const [memoryBlocks, setMemoryBlocks] = useState(
    new Array(15).fill(null).map(() => ({ size: Math.floor(Math.random() * 200) + 100, process: null }))
  );

  // Function to add a new process
  const handleAddProcess = (process) => {
    const arrivalTime = Date.now();
    const newProcess = { ...process, arrivalTime, memory: process.numPages * 100 }; // Calculate memory required
    setProcesses([newProcess, ...processes]);
    console.log('Processes:', processes); // Log to check the state
  };

  // Function to allocate memory for a process
  const allocateMemory = (process) => {
    console.log('Attempting memory allocation for process:', process.pid);

    const requiredMemory = process.memory;
    let allocated = false;
    let newMemoryBlocks = [...memoryBlocks];

    // Find the best-fit memory block
    let bestIndex = -1;
    let bestFitSize = Infinity;

    newMemoryBlocks.forEach((block, index) => {
      if (!block.process && block.size >= requiredMemory && block.size < bestFitSize) {
        bestFitSize = block.size;
        bestIndex = index;
      }
    });

    if (bestIndex !== -1) {
      const allocatedBlock = newMemoryBlocks[bestIndex];
      allocatedBlock.process = process;

      // Split the block if there's remaining memory
      const remainingSize = allocatedBlock.size - requiredMemory;
      if (remainingSize > 0) {
        newMemoryBlocks.splice(bestIndex + 1, 0, { size: remainingSize, process: null });
      }

      allocatedBlock.size = requiredMemory;
      setMemoryBlocks(newMemoryBlocks);
      allocated = true;
      console.log(`Memory allocated for process ${process.pid}`);
    } else {
      console.log(`Failed to allocate memory for process ${process.pid}`);
    }

    return allocated;
  };

  // Function to move processes to the Ready Queue (SJF logic)
  const moveToReadyQueueSJF = () => {
    if (processes.length === 0) {
      console.log("No processes to move to Ready Queue.");
      return;
    }

    let newProcessQueue = [...processes];
    let newReadyQueue = [...readyQueue];

    // Sort processes by burst time (Shortest Job First)
    newProcessQueue.sort((a, b) => a.burstTime - b.burstTime);

    // Iterate through all processes in the queue
    for (let i = 0; i < newProcessQueue.length; i++) {
      const processToMove = newProcessQueue[i];
      console.log('Process to move:', processToMove);

      // Validate the process data
      if (processToMove.numPages && processToMove.numPages > 0 && !isNaN(processToMove.burstTime)) {
        const isMemoryAllocated = allocateMemory(processToMove);
        console.log('Memory allocated:', isMemoryAllocated);

        if (isMemoryAllocated) {
          // Remove the process from the Process Queue
          newProcessQueue.splice(i, 1);
          // Add the process to the Ready Queue
          newReadyQueue.push(processToMove);

          // Update the state
          setProcesses(newProcessQueue);
          setReadyQueue(newReadyQueue);

          // Exit the loop after allocating memory for one process
          break;
        }
      } else {
        console.log('Invalid process data:', processToMove);
      }
    }
  };

  // Move processes from Process Queue to Ready Queue at random intervals (SJF)
  useEffect(() => {
    const getRandomInterval = () => Math.floor(Math.random() * 10) + 1; // Random interval between 1 and 10 seconds
    const interval = setInterval(moveToReadyQueueSJF, getRandomInterval() * 1000); // Convert to milliseconds

    return () => clearInterval(interval); // Clear the interval when the component unmounts
  }, [processes, memoryBlocks]);

  // Move processes from Ready Queue to Running Process
  useEffect(() => {
    if (!runningProcess && readyQueue.length > 0) {
      const nextProcess = readyQueue[0];
      setReadyQueue((prevReadyQueue) => prevReadyQueue.slice(1)); // Remove from Ready Queue
      setRunningProcess({ ...nextProcess, state: 'ready' });

      setTimeout(() => {
        setRunningProcess({ ...nextProcess, state: 'running' });
      }, 5000);
    }
  }, [readyQueue, runningProcess]);

  // Move processes from Running Process to Terminated Processes
  useEffect(() => {
    if (runningProcess && runningProcess.state === 'running') {
      const timeout = setTimeout(() => {
        setTerminatedProcesses((prevTerminatedProcesses) => [
          ...prevTerminatedProcesses,
          runningProcess,
        ]);
        setRunningProcess(null);

        // Free memory occupied by the terminated process
        const newMemoryBlocks = memoryBlocks.map((block) =>
          block.process && block.process.pid === runningProcess.pid ? { ...block, process: null } : block
        );
        setMemoryBlocks(newMemoryBlocks);
      }, runningProcess.burstTime * 1000);

      return () => clearTimeout(timeout); // Clear timeout when the component unmounts
    }
  }, [runningProcess, memoryBlocks]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/fcfs"
            element={
              <div>
                <h1 style={{ marginLeft: '25px' }}>FCFS Scheduling Algorithm</h1>
                <ProcessInput onAddProcess={handleAddProcess} />

                {/* Memory Map Section */}
                <div className="memory-map-container">
                  <MemoryMap memoryBlocks={memoryBlocks} />
                </div>

                {/* Queues Section */}
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
                          key={terminatedProcess.arrivalTime}
                          terminatedProcess={terminatedProcess}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/sjf"
            element={
              <div>
                <h1 style={{ marginLeft: '25px' }}>SJF Scheduling Algorithm</h1>
                <ProcessInput onAddProcess={handleAddProcess} />

                {/* Memory Map Section */}
                <div className="memory-map-container">
                  <MemoryMap memoryBlocks={memoryBlocks} />
                </div>

                {/* Queues Section */}
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
                          key={terminatedProcess.arrivalTime}
                          terminatedProcess={terminatedProcess}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;