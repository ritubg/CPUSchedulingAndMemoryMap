const { calculateTimes, generateGanttChart } = require('./utils');

const sjfScheduling = (processes) => {
  processes.sort((a, b) => a.burstTime - b.burstTime);
  let currentTime = 0;
  const { totalWT, totalTT, schedule } = calculateTimes(processes, currentTime);
  const avgWT = totalWT / processes.length;
  const avgTT = totalTT / processes.length;
  const cpuUtilization = (processes.reduce((acc, p) => acc + p.burstTime, 0) / currentTime) * 100;

  return { schedule, ganttChart: generateGanttChart(schedule), avgWT, avgTT, cpuUtilization };
};

module.exports = sjfScheduling;
