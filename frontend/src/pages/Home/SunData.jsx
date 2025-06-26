import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SunDataList = () => {
  const [sunData, setSunData] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/sundata')
      .then(response => setSunData(response.data))
      .catch(error => console.error('Error fetching sun data:', error));
  }, []);



  return (
    <div>
      <h2>Sunrise and Sunset Times</h2>
      {sunData.date ? (
        <ul>
            <li>
    Date: {sunData.date}, Sunrise: {sunData.sunrise}, Sunset: {sunData.sunset}, 
    Daylight: {sunData.daylight_duration_hours} hours
    </li>
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>

  );
}

export default SunDataList;
