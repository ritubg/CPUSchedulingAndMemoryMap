import React, { useEffect } from 'react';

const ReadyQueue = ({ readyQueue }) => {
  return (
    <div className="ready-queue">
      {readyQueue.length === 0 ? (
        <p>No processes in the ready queue</p>  
      ) : (
        readyQueue.map((process, index) => (
          <div key={index} className="ready-process">
            {process.pid} 
          </div>
        ))
      )}
    </div>
  );
};

export default ReadyQueue;


