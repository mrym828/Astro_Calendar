import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Calendar, FileText } from 'lucide-react';
import EventsCard from '../Events/EventsList/EventsCard';

const Archive = () => {
 const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedEventType, setSelectedEventType] = useState('All Events');

  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
  
  const eventTypes = [
    { name: 'All Events', icon: '✨', emoji: '✨' },
    { name: 'Lunar Events', icon: '🌙', emoji: '🌙' },
    { name: 'Solar Events', icon: '☀️', emoji: '☀️' },
    { name: 'Meteor Events', icon: '☄️', emoji: '☄️' },
    { name: 'Planetary', icon: '🪐', emoji: '🪐' },
    { name: 'Eclipses', icon: '🌘', emoji: '🌘' },
    { name: 'Special Events', icon: '🚀', emoji: '🚀' }
  ];

  const archiveResults = [
    { id: 1, title: 'Placeholder', tags: ['Eclipse', 'placeholder'] },
    { id: 2, title: 'Placeholder', tags: ['Eclipse', 'placeholder'] },
    { id: 3, title: 'Placeholder', tags: ['Eclipse', 'placeholder'] },
    { id: 4, title: 'Placeholder', tags: ['Eclipse', 'placeholder'] },
    { id: 5, title: 'Placeholder', tags: ['Eclipse', 'placeholder'] }
  ];

  const scrollYears = (direction) => {
    const currentIndex = years.indexOf(selectedYear);
    if (direction === 'left' && currentIndex > 0) {
      setSelectedYear(years[currentIndex - 1]);
    } else if (direction === 'right' && currentIndex < years.length - 1) {
      setSelectedYear(years[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen mt-10 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Year Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-gray-100">Select Year</h2>
          
          <div className="relative  rounded-2xl p-8 backdrop-blur-sm ">
            {/* Timeline Line */}
            <div className="absolute top-1/3 left-4 right-4 h-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 transform -translate-y-1/2"></div>
            
            <div className="flex items-center justify-between relative z-10">
              {years.map((year, index) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`relative group transition-all duration-300 transform ${
                    selectedYear === year 
                      ? 'scale-110' 
                      : 'hover:scale-105'
                  }`}
                >
                  {/* Glow effect for selected year */}
                  {selectedYear === year && (
                    <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl scale-150 animate-pulse"></div>
                  )}
                  
                  {/* Year dot */}
                  <div className={`relative w-6 h-6 rounded-full mb-4 mx-auto transition-all duration-300 ${
                    selectedYear === year 
                      ? 'bg-gradient-to-r from-purple-400 to-purple-600 shadow-lg shadow-purple-500/50 ring-4 ring-purple-400/30' 
                      : 'bg-[#2C195A] border-2 border-[#6A33CE] group-hover:bg-purple-400 group-hover:shadow-md group-hover:shadow-purple-400/30'
                  }`}>
                    {selectedYear === year && (
                      <div className="absolute inset-1 bg-white/20 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Year label */}
                  <span className={`text-sm font-semibold transition-all duration-300 ${
                    selectedYear === year 
                      ? 'text-purple-300 font-bold' 
                      : 'text-gray-400 group-hover:text-purple-300'
                  }`}>
                    {year}
                  </span>
                  
                  {/* Active indicator line */}
                  {selectedYear === year && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-transparent rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Navigation Arrows */}
            <div className="flex justify-center space-x-6 mt-8">
              <button 
                onClick={() => scrollYears('left')}
                disabled={selectedYear === years[0]}
                className={`group p-3 rounded-full transition-all duration-300 ${
                  selectedYear === years[0]
                    ? ' text-gray-600 cursor-not-allowed'
                    : 'border border-white hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transform hover:scale-105'
                }`}
              >
                <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
              <button 
                onClick={() => scrollYears('right')}
                disabled={selectedYear === years[years.length - 1]}
                className={`group p-3 rounded-full transition-all duration-300 ${
                  selectedYear === years[years.length - 1]
                    ? ' text-gray-600 cursor-not-allowed'
                    : 'border border-white hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transform hover:scale-105'
                }`}
              >
                <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Filter by Event Type</h2>
          
          <div className="grid grid-cols-7 gap-4">
            {eventTypes.map((eventType) => (
              <button
                key={eventType.name}
                onClick={() => setSelectedEventType(eventType.name)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedEventType === eventType.name
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-gray-700 bg-gray-800 hover:border-purple-400 hover:bg-purple-900/20'
                }`}
              >
                <div className="text-3xl mb-2">{eventType.emoji}</div>
                <div className="text-sm font-medium text-center">{eventType.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Archive Results */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Archive Results</h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Sort By:</span>
                <select className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm">
                  <option>Date (Newest)</option>
                  <option>Date (Oldest)</option>
                  <option>Name</option>
                </select>
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export Data</span>
              </button>
            </div>
          </div>
          
          {/* Results Grid */}
          <div className="grid grid-cols-3 gap-6">
            {archiveResults.map((result) => (
                <EventsCard key={result.id} event={result}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;