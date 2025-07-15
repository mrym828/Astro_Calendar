import { useMemo } from 'react';
import useMoonService from '../Services/Moon_service';
import useEarthService from '../Services/Earth_service';
import useEclipseService from '../Services/Eclipse_service';
import useMoonPosService from '../Services/moon_pos_service';

const useEvents = () => {
  const { moonEvents, loading: moonLoading, error: moonError } = useMoonService();
  const { earthEvents, EarthEventsT, loading: earthLoading, error: earthError } = useEarthService();
  const { EclipsEvents, EclipseEventsT, loading: EclipseLoading, error: EclipseError } = useEclipseService();
  const { MoonPosEvents, MoonPosEventsT, loading: MoonLoading, error: MoonError } = useMoonPosService();


  const events = useMemo(() => {
    const combinedEvents = [...moonEvents, ...EarthEventsT, ...EclipseEventsT, ...MoonPosEventsT];
    
    return combinedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [moonEvents, EarthEventsT, EclipseEventsT, MoonPosEventsT]);

  const loading = moonLoading || earthLoading || EclipseLoading || MoonLoading;
  const error = moonError || earthError || EclipseError || MoonError;

  const filterEventsByType = (eventType) => {
    return events.filter(event => event.type === eventType);
  };

  const filterEventsByDateRange = (startDate, endDate) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const getUpcomingEvents = (limit = 10) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= futureDate;
      })
      .slice(0, limit);
  };

  const getEventsForMonth = (year, month) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const getEventById = (id) => {
    return events.find(event => event.id === id);
  };

  const getEventTypes = () => {
    const types = new Set(events.map(event => event.type));
    return Array.from(types);
  };

  return {
    events,
    moonEvents,
    earthEvents: EarthEventsT,
    EclipsEvents: EclipseEventsT,
    MoonPos: MoonPosEventsT,
    loading,
    error,
    filterEventsByType,
    filterEventsByDateRange,
    getUpcomingEvents,
    getEventsForMonth,
    getEventById,
    getEventTypes
  };
};

export default useEvents;