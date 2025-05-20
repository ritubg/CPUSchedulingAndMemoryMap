# CPU Scheduling Algorithms Simulator
A **visual simulator** for various CPU scheduling algorithms with memory management capabilities.
## Frontend Architecture Overview
- **Built with React + React Router, featuring**:
  - **Dynamic state management (Hooks: useState, useEffect, useCallback)**
  - **Multi-page routing (FCFS/SJF/RR/Priority views)**
  - **Real-time process visualization (Queues, CPU, Memory)**
  - **Interactive controls (Process input, time quantum settings)**
## Features
- **Multiple Scheduling Algorithms**:
  - **First-Come, First-Served (FCFS)**
  - **Shortest Job First (SJF)**
  - **Round Robin (RR)** with time quantum
  - **Priority Non-Preemptive Scheduling**
- **Memory Management**:
  - **Best-fit memory allocation** strategy
  - Visual memory map display
  - Dynamic memory partitioning
- **Process Simulation**:
  - Process creation with customizable parameters
  - Visual queues for new, ready, running, blocked, and terminated processes
  - Real-time process state transitions
- **Performance Metrics**:
  - **Waiting time** and **turnaround time** calculations
  - **CPU utilization** statistics
  - **Gantt chart** visualization
## Deployment using Vercel
    Link to the website : https://cpu-scheduling-memory-map.vercel.app/
## Getting Started
1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/cpuSchedulingSimulator.git
   cd cpuSchedulingSimulator
2. **Install dependencies**:
   ```bash
   npm install
3. **Run the development server**:
   ```bash
   npm run
4. **Open in browser**:
   ```bash
   http://localhost:3000
