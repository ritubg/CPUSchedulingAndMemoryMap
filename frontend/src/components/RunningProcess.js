import React from 'react';
import '../Styles/RunningProcess.css'; // Ensure this path is correct for your CSS file
const RunningProcess = ({ runningProcess }) => {
  return (
    <div className="running-process-container">
<h2 style={{ marginLeft: "-1270px" }}>Running Process</h2>
  {runningProcess ? (
        <div className="running-process-circle">
          <span>{runningProcess.pid}</span> {/* Display the process PID inside the circle */}
        </div>
      ) : (
        <p></p> // This is the fallback when there's no running process
      )}
    </div>
  );
};


export default RunningProcess;
