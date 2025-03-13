// src/components/Animation.js
import React, { useState, useEffect } from 'react';

const Animation = ({ processState }) => {
  const [currentState, setCurrentState] = useState(processState);

  useEffect(() => {
    if (processState !== currentState) {
      setCurrentState(processState);
    }
  }, [processState]);

  return (
    <div className={`process-animation ${currentState}`}>
      {`Process ${currentState}`}
    </div>
  );
};

export default Animation;
