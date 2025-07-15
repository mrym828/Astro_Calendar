import { useEffect, useState } from 'react';
import axios from 'axios';


const useEclipseService = () => {
  const [events, setEvents] = useState([]);
  const [typedEvents, setTypedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEclipseEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/eclipses/`);
        const truncateDescription = (text, wordLimit) => {
            if (!text) return 'No description available.';
            const words = text.split(' ');
            return words.length > wordLimit
                ? words.slice(0, wordLimit).join(' ') 
                : text;
            };
        const transformed = response.data.results.map(event => {
          const normalizedDate = new Date(event.date_time);
          return {
            ...event,
            id: event.id,
            type: 'Eclipse',
            title: event.raw_api_data?.type
                .replace(/_/g, ' ')        
                .replace(/\b\w/g, c => c.toUpperCase()),
            date: normalizedDate,
            icon: '🌕',
            color:'red',
            description: truncateDescription(event.description, 26),
            overview: `Obscuration: ${event.obscuration_percentage}% • Duration: ${(event.duration_seconds / 60).toFixed(1)} mins • Type: ${event.eclipse_type.replace('_', ' ')}`,
            timings: {
                rise: event.raw_api_data?.rise,
                set: event.raw_api_data?.set,
                highlights: event.raw_api_data?.eventHighlights || {},
                },
            altitudes: {
                partialBegin: event.partial_begin_altitude,
                totalBegin: event.total_begin_altitude,
                peak: event.peak_altitude,
                totalEnd: event.total_end_altitude,
                partialEnd: event.partial_end_altitude,
            },
            visibility: event.visibility_regions,
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

    fetchEclipseEvents();
  }, []);

  return { EclipseEvents: events, EclipseEventsT: typedEvents, loading, error };
};

export default useEclipseService;
