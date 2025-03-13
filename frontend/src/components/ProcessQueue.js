import '../Styles/ProcessQueue.css';
import React, { useEffect } from 'react';

const ProcessQueue = ({ processes }) => {
  useEffect(() => {
    const queueContainer = document.querySelector('.process-queue');
    // Ensure the new processes are always scrolled into view
    queueContainer.scrollLeft = queueContainer.scrollWidth;
  }, [processes]);

  return (
    <div className="process-queue">
      {processes.map((process, index) => (
        <div key={index} className="process-circle">
          {process.pid}
        </div>
      ))}
    </div>
  );
};

export default ProcessQueue;
