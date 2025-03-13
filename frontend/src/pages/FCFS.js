import React, { useState, useEffect } from 'react';
import { getFcfsData } from '../services/api'; // Adjust based on your file structure
import ProcessQueue from '../components/ProcessQueue';
import GanttChart from '../components/GanttChart';
import CpuUtilization from '../components/CpuUtilization';

const FCFS = () => {
  const [processes, setProcesses] = useState([]);
  const [ganttChart, setGanttChart] = useState([]); // Default to an empty array
  const [cpuUtilization, setCpuUtilization] = useState(0);

  useEffect(() => {
    const fetchFcfsData = async () => {
      try {
        const data = await getFcfsData([
          { id: 1, arrivalTime: 0, burstTime: 4 },
          { id: 2, arrivalTime: 1, burstTime: 3 },
          { id: 3, arrivalTime: 2, burstTime: 5 },
        ]);
        
        if (data && data.schedule) {
          setProcesses(data.schedule || []);
          setGanttChart(data.ganttChart || []); // Default to empty array if ganttChart is undefined
          setCpuUtilization(data.cpuUtilization || 0); // Default to 0 if cpuUtilization is undefined
        } else {
          console.error("Invalid FCFS data:", data);
        }
      } catch (error) {
        console.error("Error fetching FCFS data:", error);
      }
    };
    
    fetchFcfsData();
  }, []);

  return (
    <div>
      <h3>FCFS Scheduling</h3>
      <ProcessQueue processes={processes} />
      <GanttChart ganttData={ganttChart} /> {/* Ensure ganttChart is always an array */}
      <CpuUtilization utilization={cpuUtilization} />
    </div>
  );
};

export default FCFS;
