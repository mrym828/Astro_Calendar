import Filters from "./Filters.Jsx";
import { useState, useMemo } from "react";
import EventGrid from './EventGrid';
import Paginations from './Paginations';
import { Filter} from 'lucide-react';
import { Link } from "react-router-dom";
import useEvents from '../../../hooks/useEvents';

const EventsList = () =>{
  const [date, setDate] = useState(new Date("2025-06-05")); 
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { events, loading, error } = useEvents();

  const filteredEventsBySelection = useMemo(() => {
      return events.filter(event => {
        const isTypeMatched = selectedTypes.size === 0 || selectedTypes.has(event.type);
        const isDateInRange = (!startDate || !endDate) || (event.date >= startDate && event.date <= endDate);
        return isTypeMatched && isDateInRange;
      });
    }, [selectedTypes, startDate, endDate, events]);

   const [filters, setFilters] = useState({
    eventType: '',
    timeRange: '',
    visibility: '',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); 
  };

  const handleClearFilters = () => {
    setFilters({
      eventType: '',
      timeRange: '',
      visibility: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  const filteredEvents = filteredEventsBySelection.filter(event => {
    const matchesType = !filters.eventType || event.type === filters.eventType;
    const matchesVisibility = !filters.visibility || event.visibility === filters.visibility;
    const matchesSearch = !filters.searchTerm || 
      event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    let matchesTime = true;
    if (filters.timeRange) {
      const eventDate = new Date(event.date);
      const now = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          matchesTime = eventDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesTime = eventDate >= now && eventDate <= weekFromNow;
          break;
        case 'month':
          const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          matchesTime = eventDate >= now && eventDate <= monthFromNow;
          break;
        case 'quarter':
          const quarterFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
          matchesTime = eventDate >= now && eventDate <= quarterFromNow;
          break;
      }
    }
    
    return matchesType && matchesVisibility && matchesSearch && matchesTime;
  });

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  // Loading and error states
  if (loading) {
    return (
      <div className="min-h-screen px-2 flex items-center justify-center">
        <div className="text-white text-xl">Loading astronomical events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-2 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading events. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-2">
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-white/70" />
              <h2 className="text-2xl font-bold text-white">Filter Events</h2>
            </div>
            <Filters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <div className="text-left flex gap-1 items-center text-white">
              Showing {filteredEvents.length} astronomical events visible from Sharjah on
              <div>
                {date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <Link to='/location'
              className="ml-2 px-3 py-2 text-sm bg-[#2b2b3f] border border-white/20 text-white rounded-md hover:bg-[#3a3a50]" >
                Change Location...
              </Link>
            </div>
          </div>

          <EventGrid events={paginatedEvents} />

          <Paginations
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default EventsList;