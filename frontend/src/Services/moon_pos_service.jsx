import { useEffect, useState } from 'react';
import axios from 'axios';

const useMoonPosService = () => {
  const [events, setEvents] = useState([]);
  const [typedEvents, setTypedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoonPosEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/events/moon-apogee-perigee`);

        const transformed = response.data.results.map(event => {
          const normalizedDate = new Date(event.date_time);
          return {
            ...event,
            id: event.id,
            type: 'Planets',
            title: event.name,
            date: normalizedDate,
            color: 'purple',
            icon: '🌑',
            description: event.description || 'No description available.',
            distance_km: event.raw_api_data?.distance_km,
          };
        });

        setEvents(response.data.results);
        setTypedEvents(transformed);
      } catch (err) {
        console.error('Error fetching Moon Position events:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoonPosEvents();
  }, []);

  return { MoonPosEvents: events, MoonPosEventsT: typedEvents, loading, error };
};

export default useMoonPosService;
