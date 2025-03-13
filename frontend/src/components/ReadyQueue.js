import '../Styles/ReadyQueue.css';
import React, { useEffect } from 'react';

const ReadyQueue = ({ readyQueue }) => {
  return (
    <div className="ready-queue">
      {readyQueue.length === 0 ? (
        <p>No processes in the ready queue</p>  // Display a message when the queue is empty
      ) : (
        readyQueue.map((process, index) => (
          <div key={index} className="ready-process">
            {process.pid}  {/* Assuming each process has a 'pid' */}
          </div>
        ))
      )}
    </div>
  );
};

export default ReadyQueue;


