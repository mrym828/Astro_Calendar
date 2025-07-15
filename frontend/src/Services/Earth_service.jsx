import { useEffect, useState } from 'react';
import axios from 'axios';

const phenomDescriptions = {
  "Perihelion": "Earth’s closest point to the Sun in its orbit, resulting in the shortest distance between them.",
  "Aphelion": "Earth’s farthest point from the Sun in its orbit, marking the longest distance between them.",
  "Equinox": "The moment when day and night are approximately equal in length, marking the start of spring or autumn.",
  "Solstice": "The point when the Sun reaches its highest or lowest position in the sky at noon, marking the longest or shortest day of the year.",
  "Day Length (Equator)": "The duration of daylight hours at the equator on a specific date.",
  "True Anomaly": "The angle between the direction of perihelion and the current position of Earth in its orbit."
};

const useEarthService = () => {
  const [events, setEvents] = useState([]);
  const [typedEvents, setTypedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarthOrbitEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/earth/`);

        const transformed = response.data.results.map(event => {
          const normalizedDate = new Date(event.date);
          return {
            ...event,
            id: event.id,
            type: 'Orbital',
            title: `Earth at ${event.phenom}`,
            date: normalizedDate,
            color: '#5e232a',
            icon: '🌏',
            description: phenomDescriptions[event.phenom] || 'No description available.',
            season:event.season,
            distance:event.distance_million_km,
            overview:event.overview
          };
        });

        setEvents(response.data.results);
        setTypedEvents(transformed);
      } catch (err) {
        console.error('Error fetching Earth orbit events:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarthOrbitEvents();
  }, []);

  return { earthEvents: events, EarthEventsT: typedEvents, loading, error };
};

export default useEarthService;
