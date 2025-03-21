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
import MemoryMap from './components/memorymap';

// Import CPU image (assuming it's in the src/assets folder)
import cpuImage from './assets/cpu.png'; // Update the path as needed

const App = () => {
  const [processes, setProcesses] = useState([]);
  const [readyQueue, setReadyQueue] = useState([]);
  const [runningProcess, setRunningProcess] = useState(null);
  const [terminatedProcesses, setTerminatedProcesses] = useState([]);
  const [memoryBlocks, setMemoryBlocks] = useState(
    new Array(15).fill(null).map(() => ({
      size: Math.floor(Math.random() * 901) + 100, // Generates a number between 100 and 1000
      process: null,
    }))
  );
  const [ganttChart, setGanttChart] = useState([]);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [totalBusyTime, setTotalBusyTime] = useState(0); // Track total busy time
  const [simulationStartTime, setSimulationStartTime] = useState(Date.now()); // Track simulation start time
  // Function to add a new process
  const handleAddProcess = (process) => {
    const arrivalTime = Date.now();
    const newProcess = {
      ...process,
      arrivalTime,
      memory: process.numPages * 100, // Calculate memory required
      state: 'new', // Initial state
    };
    setProcesses([...processes, newProcess]);
    console.log('Process added to Process Queue:', newProcess);
  };

  // Function to allocate memory for a process (best-fit algorithm)
  const allocateMemory = (process) => {
    const requiredMemory = process.memory;
    let newMemoryBlocks = [...memoryBlocks];

    console.log('Attempting to allocate memory for process:', process.pid, 'Required Memory:', requiredMemory);
    console.log('Memory Blocks Before Allocation:', newMemoryBlocks);

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

      console.log('Memory Blocks After Allocation:', newMemoryBlocks);
      return true; // Memory allocated successfully
    }

    console.log('Memory Allocation Failed: No suitable block found');
    return false; // Memory allocation failed
  };

  // Function to defragment memory
  const defragmentMemory = () => {
    console.log('Defragmenting Memory...');
    let newMemoryBlocks = memoryBlocks.filter((block) => block.process !== null);
    const freeMemory = memoryBlocks.reduce(
      (sum, block) => (block.process === null ? sum + block.size : sum),
      0
    );
    if (freeMemory > 0) {
      newMemoryBlocks.push({ size: freeMemory, process: null });
    }
    setMemoryBlocks(newMemoryBlocks);
    console.log('Memory Blocks After Defragmentation:', newMemoryBlocks);
  };

  // Function to move processes to the Ready Queue (FCFS logic)
  const moveToReadyQueueFCFS = () => {
    if (processes.length === 0) {
      console.log('No processes in the Process Queue.');
      return;
    }

    let newProcessQueue = [...processes];
    let newReadyQueue = [...readyQueue];

    // Move the first process in the queue
    const processToMove = newProcessQueue[0];

    if (processToMove.numPages && processToMove.numPages > 0 && !isNaN(processToMove.burstTime)) {
      console.log('Attempting to move process to Ready Queue:', processToMove.pid);

      const isMemoryAllocated = allocateMemory(processToMove);

      if (isMemoryAllocated) {
        // Remove the process from the Process Queue
        newProcessQueue.splice(0, 1);
        // Add the process to the Ready Queue with readyQueueArrivalTime
        const processWithReadyQueueArrivalTime = {
          ...processToMove,
          readyQueueArrivalTime: Date.now(), // Record arrival time in ready queue
        };
        newReadyQueue.push(processWithReadyQueueArrivalTime);

        // Update the state
        setProcesses(newProcessQueue);
        setReadyQueue(newReadyQueue);

        console.log('Process moved to Ready Queue:', processToMove.pid);
      } else {
        // If memory allocation fails, defragment memory and retry
        console.log('Memory allocation failed. Defragmenting memory...');
        defragmentMemory();
        moveToReadyQueueFCFS(); // Retry after defragmentation
      }
    } else {
      console.log('Invalid process:', processToMove);
    }
  };

  // Move processes from Ready Queue to Running Process
  useEffect(() => {
    if (!runningProcess && readyQueue.length > 0) {
      const nextProcess = readyQueue[0];
      setReadyQueue((prevReadyQueue) => prevReadyQueue.slice(1)); // Remove from Ready Queue
      setRunningProcess({ 
        ...nextProcess,
        state: 'running',
        runningStartTime: Date.now(), // Record start time in running state
      });
      console.log('Process moved to Running State:', nextProcess.pid);
    }
  }, [readyQueue, runningProcess]);

  // Move processes from Running Process to Terminated Processes
  useEffect(() => {
    if (runningProcess && runningProcess.state === 'running') {
      const timeout = setTimeout(() => {
        // Check if the process is already in the terminated list
        const isAlreadyTerminated = terminatedProcesses.some(
          (process) => process.pid === runningProcess.pid
        );

        if (!isAlreadyTerminated) {
          // Calculate waiting time
          const waitingTime = (runningProcess.runningStartTime - runningProcess.readyQueueArrivalTime) / 1000; // Convert to seconds

          setTerminatedProcesses((prevTerminatedProcesses) => [
            ...prevTerminatedProcesses,
            {
              ...runningProcess,
              waitingTime,
              turnaroundTime: waitingTime + runningProcess.burstTime, // Turnaround time = waiting time + burst time
            },
          ]);
          console.log('Process moved to Terminated State:', runningProcess.pid);
        }

        setRunningProcess(null);

        // Free memory occupied by the terminated process
        const newMemoryBlocks = memoryBlocks.map((block) =>
          block.process && block.process.pid === runningProcess.pid ? { ...block, process: null } : block
        );
        setMemoryBlocks(newMemoryBlocks);

        // Update Gantt Chart
        setGanttChart((prevGanttChart) => [
          ...prevGanttChart,
          {
            pid: runningProcess.pid,
            start: runningProcess.runningStartTime,
            end: Date.now(),
          },
        ]);

        // Update CPU Utilization
        const busyTime = runningProcess.burstTime * 1000;
        setTotalBusyTime((prevTotalBusyTime) => prevTotalBusyTime + busyTime);

        const totalSimulationTime = Date.now() - simulationStartTime;
        const utilization = (totalBusyTime + busyTime) / totalSimulationTime * 100;
        setCpuUtilization(utilization);      }, runningProcess.burstTime * 1000);

      return () => clearTimeout(timeout);
    }
  }, [runningProcess, memoryBlocks, terminatedProcesses]);

  // Automatically move processes to the Ready Queue every 5 seconds
  useEffect(() => {
    const interval = setInterval(moveToReadyQueueFCFS, 5000); // Move every 5 seconds
    return () => clearInterval(interval);
  }, [processes, memoryBlocks]);

  // Calculate Waiting Time (WT) and Turnaround Time (TT)
  const calculateMetrics = () => {
    const avgWaitingTime =
      terminatedProcesses.reduce((sum, process) => sum + process.waitingTime, 0) /
        terminatedProcesses.length || 0;
    const avgTurnaroundTime =
      terminatedProcesses.reduce((sum, process) => sum + process.turnaroundTime, 0) /
        terminatedProcesses.length || 0;

    return { avgWaitingTime, avgTurnaroundTime };
  };

  const { avgWaitingTime, avgTurnaroundTime } = calculateMetrics();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/fcfs"
            element={
              <div className="main-container">
                {/* Input Section at the Top */}
                <div className="input-section">
                  <h1>FCFS Scheduling Algorithm</h1>
                  <ProcessInput onAddProcess={handleAddProcess} />
                </div>

                {/* Memory Map and Queues Section */}
                <div className="content-container">
                  {/* Memory Map Section */}
                  <div className="memory-map-container">
                    <MemoryMap memoryBlocks={memoryBlocks} />
                  </div>

                  {/* Queues Section */}
                  <div className="queues-container">
                    {/* Process Queue */}
                    <div className="queue">
                      <h2>Process Queue</h2>
                      <ProcessQueue processes={processes} />
                    </div>

                    {/* Ready Queue */}
                    <div className="queue">
                      <h2>Ready Queue</h2>
                      <ReadyQueue readyQueue={readyQueue} />
                    </div>

                    {/* Running Process */}
                    <div className="running-process-container">
                      <h2>Running Process</h2>
                      <img src={cpuImage} alt="CPU" className="cpu-image" />
                      <div className="running-process-circle">
                        {runningProcess ? runningProcess.pid : ""}
                      </div>
                    </div>

                    {/* Terminated Processes */}
                    <div className="queue">
                      <h2>Terminated Processes</h2>
                      <div className="terminated-process-container">
                        {terminatedProcesses.map((process) => (
                          <div key={process.pid} className="process-info">
                            <div className="terminated-process-circle">
                              {process.pid}
                            </div>
                            <div className="terminated-process-burst-time">
                              Burst Time: {process.burstTime}
                            </div>
                            <div className="terminated-process-waiting-time">
                              Waiting Time: {process.waitingTime.toFixed(2)}s
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics Section */}
                <div className="metrics-container">
                  <h2>Results</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Process ID</th>
                        <th>Waiting Time (WT)</th>
                        <th>Turnaround Time (TT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {terminatedProcesses.map((process) => (
                        <tr key={process.pid}>
                          <td>{process.pid}</td>
                          <td>{process.waitingTime.toFixed(2)}</td>
                          <td>{process.turnaroundTime.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="avg-metrics">
                    <p>Average Waiting Time: {avgWaitingTime.toFixed(2)}</p>
                    <p>Average Turnaround Time: {avgTurnaroundTime.toFixed(2)}</p>
                    <p>CPU Utilization: {cpuUtilization.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Gantt Chart Section */}
                <div className="gantt-chart-container">
                  <h2>Gantt Chart</h2>
                  <div className="gantt-chart">
                    {ganttChart.map((entry, index) => (
                      <div key={index} className="gantt-entry">
                        <div className="gantt-process">P{entry.pid}</div>
                        <div className="gantt-time">
                          {new Date(entry.start).toLocaleTimeString()} -{" "}
                          {new Date(entry.end).toLocaleTimeString()}
                        </div>
                      </div>
            ))}
                  </div>
            
                </div>
                <div style={{ width: '100px' }}></div>

              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;