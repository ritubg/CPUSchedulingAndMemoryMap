const { calculateTimes, generateGanttChart } = require('./utils');

const fcfsScheduling = (processes) => {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  const { totalWT, totalTT, schedule } = calculateTimes(processes, currentTime);
  const avgWT = totalWT / processes.length;
  const avgTT = totalTT / processes.length;
  const cpuUtilization = (processes.reduce((acc, p) => acc + p.burstTime, 0) / currentTime) * 100;

  return { schedule, ganttChart: generateGanttChart(schedule), avgWT, avgTT, cpuUtilization };
};

module.exports = fcfsScheduling;
