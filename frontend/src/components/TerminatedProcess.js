//import React from 'react';
import '../Styles/terminatedProcess.css'; // Ensure this path is correct for your CSS file

const TerminatedProcess = ({ terminatedProcess }) => {
  return (
    <div className="terminated-process-container">
      {terminatedProcess ? (
        <>
          <div className="terminated-process-circle">
            <span>{terminatedProcess.pid}</span> {/* Display the PID inside the circle */}
          </div>
          <div className="terminated-process-burst-time">
            Burst Time: {terminatedProcess.burstTime} {/* Display burst time next to PID */}
          </div>
        </>
      ) : (
        <p></p> // This is the fallback when there's no terminated process
      )}
    </div>
  );
};

export default TerminatedProcess;
