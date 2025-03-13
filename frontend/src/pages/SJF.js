import React, { useState, useEffect } from 'react';
import { getSjfData } from '../services/api';
import ProcessQueue from '../components/ProcessQueue';
import GanttChart from '../components/GanttChart';
import CpuUtilization from '../components/CpuUtilization';

const SJF = () => {
  const [processes, setProcesses] = useState([]);
  const [ganttChart, setGanttChart] = useState([]);
  const [cpuUtilization, setCpuUtilization] = useState(0);

  useEffect(() => {
    const fetchSjfData = async () => {
      const data = await getSjfData();
      setProcesses(data.schedule);
      setGanttChart(data.ganttChart);
      setCpuUtilization(data.cpuUtilization);
    };
    fetchSjfData();
  }, []);

  return (
    <div>
      <h3>SJF Scheduling</h3>
      <ProcessQueue processes={processes} />
      <GanttChart ganttData={ganttChart} />
      <CpuUtilization utilization={cpuUtilization} />
    </div>
  );
};

export default SJF;
