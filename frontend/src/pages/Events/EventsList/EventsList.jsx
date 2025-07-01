import Filters from "./Filters.Jsx";
import { useState } from "react";
import EventGrid from './EventGrid';
import Paginations from './Paginations';
import { Filter} from 'lucide-react';
import { duration } from "@mui/material";


export const mockEvents = [
  {
    id: 1,
    title: "Perseid Meteor Shower Peak",
    type: "meteor shower",
    date: "2025-08-12",
    start_time: "11:00 PM",
    end_time: '12:00 AM',
    location: "Dark Sky Reserve, Utah",
    visibility: "public",
    attendees: 850,
    price: 0,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop",
    description: "Witness the spectacular Perseid meteor shower with up to 60 meteors per hour. Best viewing conditions in decades with new moon phase.",
    featured: true,
    magnitude: "Bright",
    constellation: "Perseus",
    duration:'3hours',
    color: 'green',
  },
  {
    id: 2,
    title: "Total Lunar Eclipse",
    type: "eclipse",
    date: "2025-09-07",
    start_time: "11:00 PM",
    end_time: '12:00 AM',
    location: "Americas, Europe, Africa",
    visibility: "12 Hours",
    attendees: 2500,
    price: 0,
    image: "https://images.unsplash.com/photo-1518066431517-eb3d8cc84e88?w=400&h=250&fit=crop",
    description: "Experience the blood moon as Earth's shadow completely covers the lunar surface. Totality lasts 1 hour and 25 minutes.",
    featured: true,
    magnitude: "Total",
    constellation: "Pisces",
    duration:'3 Hours 24 Minutes',
    color: 'red',
  },
  {
    id: 3,
    title: "Jupiter at Opposition",
    type: "planetary",
    date: "2025-11-03",
    time: "20:00",
    location: "Worldwide",
    visibility: "public",
    attendees: 1200,
    price: 0,
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=250&fit=crop",
    description: "Jupiter reaches its closest approach to Earth, appearing largest and brightest. Perfect time to observe the Great Red Spot and moons.",
    featured: false,
    magnitude: "-2.9",
    constellation: "Taurus",
    duration:'3hours'
  },
  {
    id: 4,
    title: "Geminid Meteor Shower",
    type: "meteor shower",
    date: "2025-12-14",
    time: "23:00",
    location: "Northern Hemisphere",
    visibility: "public",
    attendees: 650,
    price: 0,
    image: "https://images.unsplash.com/photo-1507908708918-778587c9e563?w=400&h=250&fit=crop",
    description: "The year's most reliable meteor shower produces multicolored meteors. Up to 120 meteors per hour at peak with excellent viewing conditions.",
    featured: true,
    magnitude: "Bright",
    constellation: "Gemini",
    duration:'3hours'
  },
  {
    id: 5,
    title: "Venus-Jupiter Conjunction",
    type: "conjunction",
    date: "2025-08-27",
    time: "19:45",
    location: "Western Sky",
    visibility: "public",
    attendees: 950,
    price: 0,
    image: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&h=250&fit=crop",
    description: "Venus and Jupiter appear incredibly close in the evening sky, separated by less than 0.5 degrees. A stunning celestial dance.",
    featured: false,
    magnitude: "Very Bright",
    constellation: "Virgo",
    duration:'3hours'
  },
  {
    id: 6,
    title: "Partial Solar Eclipse",
    type: "eclipse",
    date: "2025-03-29",
    time: "14:20",
    location: "Europe, Asia, Africa",
    visibility: "public",
    attendees: 1800,
    price: 0,
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=250&fit=crop",
    description: "The Moon covers 85% of the Sun's disk at maximum eclipse. Use proper solar filters to safely observe this celestial spectacle.",
    featured: false,
    magnitude: "85% coverage",
    constellation: "Pisces",
    duration:'3hours'
  },
  {
    id: 7,
    title: "Saturn Ring Plane Crossing",
    type: "planetary",
    date: "2025-05-06",
    time: "21:15",
    location: "Worldwide",
    visibility: "members",
    attendees: 300,
    price: 25,
    image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400&h=250&fit=crop",
    description: "Rare astronomical event where Earth crosses Saturn's ring plane. The rings appear edge-on and virtually disappear from view.",
    featured: false,
    magnitude: "Rare",
    constellation: "Aquarius",
    duration:'3hours'
  },
  {
    id: 8,
    title: "Comet C/2023 A3 Tsuchinshan-ATLAS",
    type: "comet",
    date: "2025-10-12",
    time: "18:30",
    location: "Northern Hemisphere",
    visibility: "public",
    attendees: 750,
    price: 0,
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=250&fit=crop",
    description: "This spectacular comet reaches its brightest as it passes closest to Earth. Visible to naked eye with impressive tail stretching across the sky.",
    featured: true,
    magnitude: "3.0",
    constellation: "Serpens",
    duration:'3hours'
  },
  {
    id: 9,
    title: "International Space Station Transit",
    type: "satellite",
    date: "2025-07-18",
    time: "05:42",
    location: "Eastern United States",
    visibility: "public",
    attendees: 180,
    price: 0,
    image: "https://images.unsplash.com/photo-1446776558166-79cfbe737b24?w=400&h=250&fit=crop",
    description: "Watch the ISS pass directly in front of the Moon in a spectacular transit lasting only 0.8 seconds. Rare photographic opportunity.",
    featured: false,
    magnitude: "-3.5",
    constellation: "Leo",
    duration:'3hours',
  },
  {
    id: 10,
    title: "International Space Station Transit",
    type: "satellite",
    date: "2025-07-18",
    time: "05:42",
    location: "Eastern United States",
    visibility: "public",
    attendees: 180,
    price: 0,
    image: "https://images.unsplash.com/photo-1446776558166-79cfbe737b24?w=400&h=250&fit=crop",
    description: "Watch the ISS pass directly in front of the Moon in a spectacular transit lasting only 0.8 seconds. Rare photographic opportunity.",
    featured: false,
    magnitude: "-3.5",
    constellation: "Leo",
    duration:'3hours'
  },
  {
    id: 11,
    title: "International Space Station Transit",
    type: "satellite",
    date: "2025-07-18",
    time: "05:42",
    location: "Eastern United States",
    visibility: "public",
    attendees: 180,
    price: 0,
    image: "https://images.unsplash.com/photo-1446776558166-79cfbe737b24?w=400&h=250&fit=crop",
    description: "Watch the ISS pass directly in front of the Moon in a spectacular transit lasting only 0.8 seconds. Rare photographic opportunity.",
    featured: false,
    magnitude: "-3.5",
    constellation: "Leo",
    duration:'3hours'
  },
  {
    id: 12,
    title: "International Space Station Transit",
    type: "satellite",
    date: "2025-07-18",
    time: "05:42",
    location: "Eastern United States",
    visibility: "public",
    attendees: 180,
    price: 0,
    image: "https://images.unsplash.com/photo-1446776558166-79cfbe737b24?w=400&h=250&fit=crop",
    description: "Watch the ISS pass directly in front of the Moon in a spectacular transit lasting only 0.8 seconds. Rare photographic opportunity.",
    featured: false,
    magnitude: "-3.5",
    constellation: "Leo",
    duration:'3hours'
  },
  {
    id: 13,
    title: "International Space Station Transit",
    type: "satellite",
    date: "2025-07-18",
    time: "05:42",
    location: "Eastern United States",
    visibility: "public",
    attendees: 180,
    price: 0,
    image: "https://images.unsplash.com/photo-1446776558166-79cfbe737b24?w=400&h=250&fit=crop",
    description: "Watch the ISS pass directly in front of the Moon in a spectacular transit lasting only 0.8 seconds. Rare photographic opportunity.",
    featured: false,
    magnitude: "-3.5",
    constellation: "Leo",
    duration:'3hours'
  },
];

const EventsList = () =>{
  const [date, setDate] = useState(new Date("2025-06-05")); // example date
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
    setCurrentPage(1); // Reset to first page when filters change
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

  // Filter events based on current filters
  const filteredEvents = mockEvents.filter(event => {
    const matchesType = !filters.eventType || event.type === filters.eventType;
    const matchesVisibility = !filters.visibility || event.visibility === filters.visibility;
    const matchesSearch = !filters.searchTerm || 
      event.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    // Simple time range filtering (you could make this more sophisticated)
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

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
            <div className="text-left flex gap-1 items-center">
              Showing events visible from Sharjah on
              <div>
                {date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button className="ml-2 px-3 py-2 text-sm bg-[#2b2b3f] border border-white/20 text-white rounded-md hover:bg-[#3a3a50]">
          Change Location...
        </button>
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
