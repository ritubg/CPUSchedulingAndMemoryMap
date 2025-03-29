import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import ProcessInput from './components/ProcessInput';
import ProcessQueue from './components/ProcessQueue';
import ReadyQueue from './components/ReadyQueue';
import MemoryMap from './components/memorymap';
import cpuImage from './assets/cpu.png';

const App = () => {
  const [processes, setProcesses] = useState([]);
  const [readyQueue, setReadyQueue] = useState([]);
  const [runningProcess, setRunningProcess] = useState(null);
  const [terminatedProcesses, setTerminatedProcesses] = useState([]);
  const [blockedProcesses, setBlockedProcesses] = useState([]);
  const [globalTimeQuantum, setGlobalTimeQuantum] = useState(5);
  const [memoryBlocks, setMemoryBlocks] = useState(
    new Array(15).fill(null).map(() => ({
      size: Math.floor(Math.random() * 901) + 100,
      process: null,
    }))
  );
  const [ganttChart, setGanttChart] = useState([]);
  const [cpuUtilization, setCpuUtilization] = useState(0);
  const [totalBusyTime, setTotalBusyTime] = useState(0);
  const [simulationStartTime, setSimulationStartTime] = useState(Date.now());
  const MEMORY_ALLOCATION_INTERVAL = 4000;

  const getCurrentSchedulingAlgorithm = () => {
    const path = window.location.pathname;
    if (path === '/fcfs') return 'FCFS';
    if (path === '/sjf') return 'SJF';
    if (path === '/rr') return 'RR';
    if (path === '/priority') return 'Priority';
    return 'RR';
  };

  const [currentSchedulingAlgorithm, setCurrentSchedulingAlgorithm] = useState(
    getCurrentSchedulingAlgorithm()
  );

  const allocateMemory = useCallback((process) => {
    const requiredMemory = process.memory;
    let newMemoryBlocks = [...memoryBlocks];
    const alreadyAllocated = newMemoryBlocks.some(block => 
      block.process?.pid === process.pid
    );
    if (alreadyAllocated) {
      return false;
    }

    let bestIndex = -1;
    let bestFitSize = Infinity;

    newMemoryBlocks.forEach((block, index) => {
      if (!block.process && block.size >= requiredMemory && block.size < bestFitSize) {
        bestFitSize = block.size;
        bestIndex = index;
      }
    });

    if (bestIndex !== -1) {
      const block = newMemoryBlocks[bestIndex];
      if (block.size > requiredMemory + 50) {
        const remainingBlock = {
          size: block.size - requiredMemory,
          process: null
        };
        const insertIndex = newMemoryBlocks.indexOf(block) + 1;
        newMemoryBlocks.splice(insertIndex, 0, remainingBlock);
        block.size = requiredMemory;
        block.process = process;
      } else {
        block.process = process;
      }
      setMemoryBlocks(newMemoryBlocks);
      return true;
    }
    return false;
  }, [memoryBlocks]);

  const periodicMemoryAllocation = useCallback(() => {
    let updatedProcesses = [...processes];
    processes.forEach((process) => {
      if (allocateMemory(process)) {
        const processToMove = {
          ...process, 
          readyQueueArrivalTime: Date.now(), 
          state: 'ready'
        };
        setReadyQueue(prev => [...prev, processToMove]);
        updatedProcesses = updatedProcesses.filter(p => p.pid !== process.pid);
      }
    });
    setProcesses(updatedProcesses);
  }, [processes, allocateMemory]);

  const handleAddProcess = (process) => {
    const arrivalTime = Date.now();
    if (process.timeQuantum) {
      setGlobalTimeQuantum(process.timeQuantum);
    }
    const pid = process.pid || `P${processes.length + 1}`;
    const newProcess = {
      ...process,
      pid,
      arrivalTime,
      memory: process.numPages * 100,
      state: 'new',
      remainingTime: process.burstTime
    };
    setProcesses(prevProcesses => [...prevProcesses, newProcess]);
  };

  useEffect(() => {
    const interval = setInterval(periodicMemoryAllocation, MEMORY_ALLOCATION_INTERVAL);
    return () => clearInterval(interval);
  }, [periodicMemoryAllocation]);

  const executeProcessFCFSSJF = useCallback((selectedProcess) => {
    if (!selectedProcess) return;
    setReadyQueue(prev => prev.filter(p => p.pid !== selectedProcess.pid));
    const runningProcessWithStartTime = {
      ...selectedProcess,
      state: 'running',
      runningStartTime: Date.now()
    };
    setRunningProcess(runningProcessWithStartTime);
    const timeout = setTimeout(() => {
      const waitingTime = (runningProcessWithStartTime.runningStartTime - runningProcessWithStartTime.readyQueueArrivalTime) / 1000;
      setTerminatedProcesses(prev => [
        ...prev,
        {
          ...runningProcessWithStartTime,
          waitingTime,
          turnaroundTime: waitingTime + runningProcessWithStartTime.burstTime,
          state: 'terminated'
        }
      ]);
      setMemoryBlocks(prev => 
        prev.map(block => 
          block.process?.pid === runningProcessWithStartTime.pid 
            ? { ...block, process: null } 
            : block
        )
      );
      setGanttChart(prev => [
        ...prev,
        {
          pid: runningProcessWithStartTime.pid,
          start: runningProcessWithStartTime.runningStartTime,
          end: Date.now()
        }
      ]);
      const busyTime = runningProcessWithStartTime.burstTime * 1000;
      setTotalBusyTime(prev => {
        const newTotalBusyTime = prev + busyTime;
        const totalSimulationTime = Date.now() - simulationStartTime;
        const utilization = (newTotalBusyTime / totalSimulationTime) * 100;
        setCpuUtilization(utilization);
        return newTotalBusyTime;
      });
      setRunningProcess(null);
    }, runningProcessWithStartTime.burstTime * 1000);
  }, [simulationStartTime, totalBusyTime]);

  const executeProcessRR = useCallback((selectedProcess) => {
    if (!selectedProcess) return;
    setReadyQueue(prev => prev.filter(p => p.pid !== selectedProcess.pid));
    const runningProcessWithStartTime = { 
      ...selectedProcess, 
      state: 'running', 
      runningStartTime: Date.now(),
      totalWaitingTime: (selectedProcess.totalWaitingTime || 0) + 
                       (Date.now() - (selectedProcess.readyQueueArrivalTime || Date.now())) / 1000
    };
    setRunningProcess(runningProcessWithStartTime);
    const timeQuantum = globalTimeQuantum * 1000;
    const blockTime = 3000;
    const remainingTimeMs = runningProcessWithStartTime.remainingTime * 1000;
    const actualExecutionTime = Math.min(remainingTimeMs, timeQuantum);
    const processTimeout = setTimeout(() => {
      const completionTime = Date.now();
      const executedBurstTime = actualExecutionTime / 1000;
      const remainingBurstTime = runningProcessWithStartTime.remainingTime - executedBurstTime;
      setGanttChart(prev => [
        ...prev,
        {
          pid: runningProcessWithStartTime.pid,
          start: runningProcessWithStartTime.runningStartTime,
          end: completionTime,
          duration: executedBurstTime
        }
      ]);
      setTotalBusyTime(prev => {
        const newTotalBusyTime = prev + actualExecutionTime;
        const totalSimulationTime = completionTime - simulationStartTime;
        setCpuUtilization((newTotalBusyTime / totalSimulationTime) * 100);
        return newTotalBusyTime;
      });
      if (remainingBurstTime <= 0.1) {
        setTerminatedProcesses(prev => [
          ...prev,
          {
            ...runningProcessWithStartTime,
            burstTime: runningProcessWithStartTime.burstTime,
            waitingTime: runningProcessWithStartTime.totalWaitingTime,
            turnaroundTime: runningProcessWithStartTime.totalWaitingTime + 
                           runningProcessWithStartTime.burstTime,
            state: 'terminated'
          }
        ]);
        setMemoryBlocks(prev => 
          prev.map(block => 
            block.process?.pid === runningProcessWithStartTime.pid 
              ? { ...block, process: null } 
              : block
          )
        );
      } else {
        const blockedProcess = { 
          ...runningProcessWithStartTime, 
          state: 'blocked', 
          blockedStartTime: completionTime,
          remainingTime: remainingBurstTime,
          totalWaitingTime: runningProcessWithStartTime.totalWaitingTime
        };
        setBlockedProcesses(prev => [...prev, blockedProcess]);
        setTimeout(() => {
          setBlockedProcesses(prevBlocked => {
            const updatedBlocked = prevBlocked.filter(
              p => p.pid !== blockedProcess.pid
            );
            setReadyQueue(prev => {
              const isAlreadyInReadyQueue = prev.some(p => p.pid === blockedProcess.pid);
              return isAlreadyInReadyQueue ? prev : [
                ...prev, 
                { 
                  ...blockedProcess, 
                  state: 'ready', 
                  readyQueueArrivalTime: Date.now() 
                }
              ];
            });
            return updatedBlocked;
          });
        }, blockTime);
      }
      setRunningProcess(null);
    }, actualExecutionTime);
  }, [simulationStartTime,globalTimeQuantum]);

  const selectProcess = useCallback(() => {
    if (runningProcess || readyQueue.length === 0) return null;
    switch (currentSchedulingAlgorithm) {
      case 'FCFS':
        return readyQueue[0];
      case 'SJF':
        return readyQueue.reduce((shortest, current) =>
          current.burstTime < shortest.burstTime ? current :
          (current.burstTime === shortest.burstTime &&
           current.readyQueueArrivalTime < shortest.readyQueueArrivalTime ? current : shortest)
        );
      case 'Priority':
          return readyQueue.reduce((highestPriority, current) =>
            current.priority < highestPriority.priority ? current :
            (current.priority === highestPriority.priority &&
             current.readyQueueArrivalTime < highestPriority.readyQueueArrivalTime ? current : highestPriority)
          );
      case 'RR':
        if (window.location.pathname === '/rr') {
          const currentProcess = readyQueue[0];
          setReadyQueue(prev => {
            const updatedQueue = [...prev.slice(1), currentProcess];
            return updatedQueue;
          });
          return currentProcess;
        }
        return readyQueue[0];
      default:
        return readyQueue[0];
    }
  }, [readyQueue, runningProcess, currentSchedulingAlgorithm]);
  
  useEffect(() => {
    const selectedProcess = selectProcess();
    if (selectedProcess) {
      if (currentSchedulingAlgorithm === 'RR' && window.location.pathname === '/rr') {
        executeProcessRR(selectedProcess);
      } else {
        executeProcessFCFSSJF(selectedProcess);
      }
    }
  }, [readyQueue, runningProcess, currentSchedulingAlgorithm, selectProcess, executeProcessFCFSSJF, executeProcessRR]);

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentSchedulingAlgorithm(getCurrentSchedulingAlgorithm());
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const calculateMetrics = () => {
    if (terminatedProcesses.length === 0) return { 
      avgWaitingTime: 0, 
      avgTurnaroundTime: 0 
    };
    const avgWaitingTime = terminatedProcesses.reduce((sum, p) => sum + p.waitingTime, 0) / terminatedProcesses.length;
    const avgTurnaroundTime = terminatedProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0) / terminatedProcesses.length;
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
              </div>
            }
          />
          <Route
            path="/sjf"
            element={
              <div className="main-container">
                {/* Input Section at the Top */}
                <div className="input-section">
                  <h1>SJF Scheduling Algorithm</h1>
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
              </div>
            }
          />
          <Route
            path="/rr"
            element={
              <div className="main-container">
                {/* Input Section at the Top */}
                <div className="input-section">
                  <h1>Round Robin Scheduling Algorithm</h1>
                  <ProcessInput onAddProcess={handleAddProcess} algorithm="rr" />
                  <div className="global-time-quantum">
                  <p>Global Time Quantum: {globalTimeQuantum} seconds</p>
                  </div>
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

                    {/* Blocked Processes */}
                    <div className="queue">
                      <h2>Blocked Processes</h2>
                      <div className="blocked-process-container">
                        {blockedProcesses.map((process) => (
                          <div key={process.pid} className="process-info">
                            <div className="blocked-process-circle">
                              {process.pid}
                            </div>
                            <div className="blocked-process-burst-time">
                                  Remaining Time: {process.remainingTime.toFixed(2)}s
                            </div>
                          </div>
                        ))}
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
              </div>
            }
          />
<Route
  path="/priority"
  element={
    <div className="main-container">
      {/* Input Section at the Top */}
      <div className="input-section">
        <h1>Priority Non-Preemptive Scheduling Algorithm</h1>
        <ProcessInput onAddProcess={handleAddProcess} algorithm="priority" />
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
    </div>
  }
/>
        </Routes>
      </div>
    </Router>
  );
};

export default App;         