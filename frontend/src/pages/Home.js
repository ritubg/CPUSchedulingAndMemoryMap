import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Tall CPU Building */}
      <div className="cpu-building">
        <div className="cpu-roof"></div>
        <div className="cpu-body">
          <div className="cpu-window"></div>
          <div className="cpu-window"></div>
          <div className="cpu-window"></div>
          <div className="cpu-window"></div>
          <div className="cpu-window"></div>
          <div className="cpu-window"></div>
          <div className="cpu-door">CPU</div>
        </div>
        <div className="cpu-base"></div>
      </div>
      
      <h2 className="home-title">Process Scheduling Simulator</h2>
      
      {/* Centered Navigation Buttons */}
      <div className="nav-container">
        <Link to="/fcfs" className="nav-button">FCFS Scheduling</Link>
        <Link to="/sjf" className="nav-button">SJF Scheduling</Link>
        <Link to="/rr" className="nav-button">Round Robin</Link>
        <Link to="/priority" className="nav-button">Priority</Link>
      </div>
      
      {/* Raised Road with Moving Processes */}
      <div className="process-road">
        <div className="road-markings"></div>
        <div className="process p1">P1</div>
        <div className="process p2">P2</div>
        <div className="process p3">P3</div>
        <div className="process p4">P4</div>
      </div>
    </div>
  );
};

export default Home;