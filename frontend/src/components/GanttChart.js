import React from 'react';

const GanttChart = ({ ganttData }) => {
  return (
    <div>
      <h4>Gantt Chart</h4>
      {ganttData && ganttData.length > 0 ? (
        <ul>
          {ganttData.map((item, index) => (
            <li key={index}>
              Process {item.processId} - Start: {item.start}, End: {item.end}
            </li>
          ))}
        </ul>
      ) : (
        <p>No Gantt chart data available</p>
      )}
    </div>
  );
};

export default GanttChart;
