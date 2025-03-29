import React from 'react';

const TerminatedProcess = ({ terminatedProcess }) => {
  return (
    <div className="terminated-process-container">
      {terminatedProcess ? (
        <>
          <div className="terminated-process-circle">
            <span>{terminatedProcess.pid}</span> 
          </div>
          <div className="terminated-process-burst-time">
            Burst Time: {terminatedProcess.burstTime}
          </div>
        </>
      ) : (
        <p></p> 
      )}
    </div>
  );
};

export default TerminatedProcess;
