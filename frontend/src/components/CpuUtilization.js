import React from 'react';

const CpuUtilization = ({ utilization }) => {
  return (
    <div>
      <h3>CPU Utilization</h3>
      <p>{utilization}%</p>
    </div>
  );
};

export default CpuUtilization;
