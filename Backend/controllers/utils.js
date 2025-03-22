const calculateTimes = (processes, currentTime) => {
  let totalWT = 0;
  let totalTT = 0;
  const schedule = [];

  for (const process of processes) {
    const waitingTime = Math.max(0, currentTime - process.arrivalTime);
    const turnaroundTime = waitingTime + process.burstTime;
    totalWT += waitingTime;
    totalTT += turnaroundTime;
    schedule.push({ ...process, waitingTime, turnaroundTime });
    currentTime += process.burstTime;
  }

  return { totalWT, totalTT, schedule };
};

const generateGanttChart = (schedule) => {
  return schedule.map((process) => ({
    pid: process.pid,
    start: process.arrivalTime,
    end: process.arrivalTime + process.burstTime,
  }));
};

module.exports = { calculateTimes, generateGanttChart };