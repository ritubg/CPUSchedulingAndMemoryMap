// Function to get data for FCFS Scheduling
export const getFcfsData = async (processes) => {
    try {
      const response = await fetch('http://localhost:5000/fcfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch FCFS data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching FCFS data:', error);
      return { error: error.message };  // Return error if something goes wrong
    }
  };
  
  // Function to get data for SJF Scheduling
  export const getSjfData = async (processes) => {
    try {
      const response = await fetch('http://localhost:5000/sjf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch SJF data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching SJF data:', error);
      return { error: error.message };  // Return error if something goes wrong
    }
  };
  
  // Function to get data for SRTF Scheduling
  export const getSrtfData = async (processes) => {
    try {
      const response = await fetch('http://localhost:5000/srtf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch SRTF data');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching SRTF data:', error);
      return { error: error.message };  // Return error if something goes wrong
    }
  };
  