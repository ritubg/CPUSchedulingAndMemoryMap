import React from 'react';
import '../Styles/memorymap.css';

const MemoryMap = ({ memoryBlocks }) => {
  return (
    <div className="memory-map">
      {memoryBlocks.map((block, index) => (
        <div
          key={index}
          className={`memory-block ${block.process ? 'allocated' : 'free'}`}
        >
          <div>
            {block.process ? (
              <>
                <div>P{block.process.pid} ({block.size})</div>
                <div className="free-space">
                  Free: {block.size - block.process.memory}
                </div>
              </>
            ) : (
              `Free (${block.size})`
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemoryMap;