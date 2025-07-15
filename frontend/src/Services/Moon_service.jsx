import { useEffect, useState } from 'react';
import axios from 'axios';

const useMoonService = () => {
  const [rawMoonData, setRawMoonData] = useState([]); 
  const [processedMoonEvents, setProcessedMoonEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoonData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/moonphases/calendar?year=2025');
        const calendar = response.data?.calendar || [];

        // Flatten all monthly phases into one array
        const allPhases = calendar.flatMap(monthData => monthData.phases || []);
        setRawMoonData(allPhases);
      } catch (err) {
        console.error('Error fetching moon data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMoonData();
  }, []);

  useEffect(() => {
    if (rawMoonData && Array.isArray(rawMoonData)) {
      const uniquePhases = new Map();
      const lastSeenPhaseDate = new Map();

      const sortedMoonData = [...rawMoonData].sort(
        (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      );

      sortedMoonData.forEach(item => {
        const date = new Date(item.date_time);
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const phaseDisplay = item.phase_display;

        const lastDateForThisPhase = lastSeenPhaseDate.get(phaseDisplay);
        let shouldAdd = true;

        if (lastDateForThisPhase) {
          const dayBefore = new Date(normalizedDate);
          dayBefore.setDate(normalizedDate.getDate() - 1);

          if (lastDateForThisPhase.getTime() === dayBefore.getTime()) {
            shouldAdd = false;
          }
        }

        if (shouldAdd) {
          const dateKey = `${normalizedDate.toISOString().split('T')[0]}-${phaseDisplay}`;
          if (!uniquePhases.has(dateKey)) {
            uniquePhases.set(dateKey, {
              id: item.id,
              title: `${phaseDisplay}`,
              date: normalizedDate,
              type: 'Moon Phase',
              color: '#253A7C',
              icon: item.icon || '🌙',
              description: item.description,
              illumination: item.illumination_percentage,
            });
          }
        }

        lastSeenPhaseDate.set(phaseDisplay, normalizedDate);
      });

      setProcessedMoonEvents(Array.from(uniquePhases.values()));
    }
  }, [rawMoonData]);

  return { moonEvents: processedMoonEvents, loading, error };
};

export default useMoonService;
