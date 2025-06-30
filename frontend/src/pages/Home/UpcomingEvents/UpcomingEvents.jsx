import { events } from '../../../data/events';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import EventsCard from './EventsCard';
import { useSwipeable } from 'react-swipeable';

const UpcomingEvents = () => {
    const [startIndex, setStartIndex] = useState(0);

  const handleNext = () => {
    if (startIndex < events.length - 1) setStartIndex(prev => prev + 0.9);
  };

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(prev => prev - 0.9);
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

    return (
        <div className="Upcoming-Events-Section" {...handlers}>
        <div className="w-full pl-8 pr-15 py-10 text-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl space-grotesk-font-bold px-4">Upcoming Events</h2>
        <div className="flex gap-3 items-center">
          <div className='text-[#B0AFAF] space-grotesk-font px-2'>
            <a href='/calendar'>
          View Calendar
          </a>
        </div>
          <button onClick={handlePrev} className="w-10 h-10 border border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition cursor-pointer">
            <ChevronLeft className="text-blue-300" />
          </button>
          <button onClick={handleNext} className="w-10 h-10 border border-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500/20 transition cursor-pointer">
            <ChevronRight className="text-blue-300" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden px-2">
        <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${startIndex * 100}%)` }}>
          {events.map((event, index) => (
          <div key={index} className="min-w-full md:min-w-[45%] px-4 cursor-pointer ">
          <EventsCard 
          title={event.title}
          date={event.date}
          description={event.description}
          badge={event.badge}
          badgeColor={event.badgeColor}
          image={event.image}/>
        </div>
          ))}
      </div>
      </div>
    </div>
    </div>
    );
};

export default UpcomingEvents;