const { calculateTimes, generateGanttChart } = require('./utils');

const rrScheduling = (processes, timeQuantum = 2) => {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let currentTime = 0;
  let queue = [];
  let schedule = [];
  let remainingTime = processes.map((p) => p.burstTime);
  let totalWT = 0;
  let totalTT = 0;
  let blockedProcesses = []; // Track blocked processes

  while (true) {
    // Add processes to the queue that have arrived by the current time
    processes.forEach((p, index) => {
      if (
        p.arrivalTime <= currentTime &&
        remainingTime[index] > 0 &&
        !queue.includes(index) &&
        !blockedProcesses.includes(index)
      ) {
        queue.push(index);
      }
    });

    // Unblock processes after 5 seconds
    blockedProcesses = blockedProcesses.filter((index) => {
      const process = processes[index];
      if (currentTime - process.blockedStartTime >= 5) {
        queue.push(index); // Add back to the queue
        return false; // Remove from blocked list
      }
      return true; // Keep in blocked list
    });

    if (queue.length === 0) {
      if (blockedProcesses.length === 0) break; // No more processes to execute
      currentTime++; // Increment time if no processes are ready
      continue;
    }

    const currentProcessIndex = queue.shift();
    const process = processes[currentProcessIndex];

    // Execute the process for the time quantum or its remaining time, whichever is smaller
    const executionTime = Math.min(remainingTime[currentProcessIndex], timeQuantum);
    schedule.push({
      pid: process.pid,
      startTime: currentTime,
      endTime: currentTime + executionTime,
    });

    // Update remaining time and current time
    remainingTime[currentProcessIndex] -= executionTime;
    currentTime += executionTime;

    if (remainingTime[currentProcessIndex] > 0) {
      // Block the process for 5 seconds
      process.blockedStartTime = currentTime;
      blockedProcesses.push(currentProcessIndex);
    } else {
      // Calculate waiting time and turnaround time for the completed process
      const waitingTime = currentTime - process.burstTime - process.arrivalTime;
      const turnaroundTime = currentTime - process.arrivalTime;
      totalWT += waitingTime;
      totalTT += turnaroundTime;
    }
  }

  const avgWT = totalWT / processes.length;
  const avgTT = totalTT / processes.length;
  const cpuUtilization = (processes.reduce((acc, p) => acc + p.burstTime, 0) / currentTime) * 100;

  return {
    schedule,
    ganttChart: generateGanttChart(schedule),
    avgWT,
    avgTT,
    cpuUtilization,
  };
};

module.exports = rrScheduling;