import { events } from '../../../data/events';
import { ChevronLeft, ChevronRight, Calendar, Filter, Grid, List } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import EventsCard from './EventsCard';
import { useSwipeable } from 'react-swipeable';

const UpcomingEvents = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterType, setFilterType] = useState('all');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState(events);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, startIndex]);

  // Filter events based on type
  useEffect(() => {
    if (filterType === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => 
        event.badge.toLowerCase().includes(filterType.toLowerCase())
      ));
    }
    setStartIndex(0); // Reset to first item when filter changes
  }, [filterType]);

  const handleNext = () => {
    if (startIndex < filteredEvents.length - 1) {
      setStartIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
    } else {
      setStartIndex(0); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    } else {
      setStartIndex(filteredEvents.length - 1); // Loop to end
    }
  };

  const goToSlide = (index) => {
    setStartIndex(index);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div className="upcoming-events-section" {...handlers}>
      <div className="w-full px-4 lg:px-8 py-10 text-white rounded-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h2 className="text-3xl lg:text-3xl space-grotesk-font-bold mb-2">Upcoming Events</h2>
          <div className="flex flex-wrap items-center gap-4">
      
            {/* Calendar link */}
            <div className="text-[#B0AFAF] space-grotesk-font">
              <a 
                href='/calendar' 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Calendar className="w-4 h-4" />
                View Calendar
              </a>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handlePrev} 
                className="w-10 h-10 border border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition-all duration-300 hover:scale-110"
                disabled={filteredEvents.length <= 1}
              >
                <ChevronLeft className="text-blue-300" />
              </button>
              <button 
                onClick={handleNext} 
                className="w-10 h-10 border border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition-all duration-300 hover:scale-110"
                disabled={filteredEvents.length <= 1}
              >
                <ChevronRight className="text-blue-300" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="relative">
            <div className="overflow-hidden p-3">
              <div 
                className="flex transition-transform duration-500 ease-in-out" 
                style={{ transform: `translateX(-${startIndex * 100}%)` }}
              >
                {filteredEvents.map((event, index) => (
                  <div key={index} className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-3">
                    <EventsCard 
                      title={event.title}
                      date={event.date}
                      description={event.description}
                      badge={event.badge}
                      badgeColor={event.badgeColor}
                      image={event.image}
                      isActive={index === startIndex}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-6 gap-2">
              {filteredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === startIndex 
                      ? 'bg-blue-400 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
        ):''}


        <div className="text-center mt-6 text-gray-400 text-sm">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;

