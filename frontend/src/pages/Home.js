import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h2>Welcome to the Process Scheduling App</h2>
      <nav>
        <ul>
          <li><Link to="/fcfs">FCFS Scheduling</Link></li>
          <li><Link to="/sjf">SJF Scheduling</Link></li>
          <li><Link to="/srtf">SRTF Scheduling</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
