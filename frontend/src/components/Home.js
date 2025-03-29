import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/home.css';

const Home = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className={`home-container ${isHomePage ? 'home-page' : ''}`}>
      <h2>PROCESS SCHEDULING SIMULATOR</h2>
      <nav>
        <ul>
          <li><Link to="/fcfs">FCFS Scheduling</Link></li>
          <li><Link to="/sjf">SJF Scheduling</Link></li>
          <li><Link to="/rr">RR Scheduling</Link></li>
          <li><Link to="/priority">Priority Scheduling</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
