const calculateTimes = (processes, currentTime) => {
    let totalWT = 0, totalTT = 0;
    const schedule = [];
  
    processes.forEach((process) => {
      const startTime = Math.max(currentTime, process.arrivalTime);
      const waitingTime = startTime - process.arrivalTime;
      const turnaroundTime = waitingTime + process.burstTime;
  
      totalWT += waitingTime;
      totalTT += turnaroundTime;
  
      schedule.push({
        processId: process.id,
        startTime,
        endTime: startTime + process.burstTime,
        waitingTime,
        turnaroundTime,
      });
  
      currentTime = startTime + process.burstTime;
    });
  
    return { totalWT, totalTT, schedule };
  };
  
  const generateGanttChart = (schedule) => {
    return schedule.map(p => ({ processId: p.processId, duration: p.endTime - p.startTime }));
  };
  
  module.exports = { calculateTimes, generateGanttChart };
  