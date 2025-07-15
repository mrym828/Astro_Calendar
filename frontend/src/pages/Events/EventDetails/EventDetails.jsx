import React, { useState } from 'react';
import { Clock, MapPin, Eye, Calendar, Globe, Moon, Sun, ArrowLeft, Users, MapPin as Location, AlertCircle } from 'lucide-react';
import useEvents from '../../../hooks/useEvents'; // Updated import path

const EventDetail = ({ eventId, onBack }) => {
  const [selectedTimezone, setSelectedTimezone] = useState('Eastern Daylight Time (UTC-4)');
  const { events, loading, error, getEventById } = useEvents();
  
  // Get the current event using the hook
  const currentEvent = getEventById((eventId));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading Event Details...</h1>
          <p className="text-slate-300">Please wait while we fetch the event information.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error Loading Event</h1>
          <p className="text-slate-300 mb-6">There was an error loading the event details. Please try again later.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Events
            </button>
          )}
        </div>
      </div>
    );
  }

  // Event not found state
  if (!currentEvent) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-slate-300 mb-6">The event you're looking for doesn't exist or may have been removed.</p>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Back to Events
            </button>
          )}
        </div>
      </div>
    );
  }

  // Generate timeline stages based on event type
  const getTimelineStages = (eventType, eventTime) => {
    const baseTime = new Date(`2025-06-15 ${eventTime}`);
    
    switch(eventType) {
      case 'Lunar Eclipse':
      case 'Solar Eclipse':
      case 'eclipse':
        return [
          { id: 1, time: '9:07 PM', label: 'Penumbral Eclipse Begins', active: false },
          { id: 2, time: '10:45 PM', label: 'Partial Eclipse Begins', active: false },
          { id: 3, time: '12:11 AM', label: 'Total Eclipse Begins', active: true },
          { id: 4, time: '1:26 AM', label: 'Maximum Eclipse', active: false },
          { id: 5, time: '2:42 AM', label: 'Eclipse Ends', active: false }
        ];
      case 'Meteor Shower':
      case 'meteor shower':
        return [
          { id: 1, time: '9:00 PM', label: 'Shower Begins', active: false },
          { id: 2, time: '11:00 PM', label: 'Activity Increases', active: false },
          { id: 3, time: '2:00 AM', label: 'Peak Activity', active: true },
          { id: 4, time: '4:00 AM', label: 'Activity Decreases', active: false },
          { id: 5, time: '6:00 AM', label: 'Dawn Ends Viewing', active: false }
        ];
      case 'Planetary Alignment':
      case 'planetary':
        return [
          { id: 1, time: '7:00 PM', label: 'Planet Rises', active: false },
          { id: 2, time: '9:00 PM', label: 'Best Viewing Begins', active: false },
          { id: 3, time: '11:00 PM', label: 'Optimal Position', active: true },
          { id: 4, time: '2:00 AM', label: 'Still Visible', active: false },
          { id: 5, time: '5:00 AM', label: 'Sets in West', active: false }
        ];
      case 'Moon Phase':
        return [
          { id: 1, time: currentEvent.time || '12:00 AM', label: 'Moon Phase Peak', active: true }
        ];
      default:
        return [
          { id: 1, time: currentEvent.time || '12:00 AM', label: 'Event Begins', active: true }
        ];
    }
  };

  const timelineStages = getTimelineStages(currentEvent.type, currentEvent.time);

  const timezoneOptions = [
    'Eastern Daylight Time (UTC-4)',
    'Central Daylight Time (UTC-5)',
    'Mountain Daylight Time (UTC-6)',
    'Pacific Daylight Time (UTC-7)',
    'Gulf Standard Time (UTC+4)',
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'Lunar Eclipse':
      case 'Solar Eclipse':
      case 'eclipse': 
        return <Moon className="text-orange-400" />;
      case 'Meteor Shower':
      case 'meteor shower': 
        return <Sun className="text-yellow-400" />;
      case 'Planetary Alignment':
      case 'planetary': 
        return <Globe className="text-blue-400" />;
      case 'conjunction': 
        return <Eye className="text-purple-400" />;
      case 'comet': 
        return <Clock className="text-green-400" />;
      case 'satellite': 
        return <MapPin className="text-red-400" />;
      case 'Moon Phase':
        return <Moon className="text-blue-400" />;
      default: 
        return <Calendar className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Back button */}
      {onBack && (
        <div className="max-w-7xl mx-auto mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-4 gap-6 space-grotesk-font">
        
        {/* Event Overview */}
        <div className="lg:col-start-1 lg:col-end-3 lg:row-start-1 lg:row-end-2 bg-[#1E1E3C] h-fit rounded-xl p-7 border border-white/30">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-white text-left">
              Event Overview
            </h2>
          </div>
          <p className="text-slate-300 mb-6 leading-relaxed text-left">
            {currentEvent.overview || 'A fascinating astronomical event that will be visible from your location.'}
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#2D3A51]/77 rounded-lg p-4">
              <div className="text-[#9DACF1] text-left text-sm">Date</div>
              <div className="text-white font-bold text-lg text-left">
                {formatDate(currentEvent.date)}
              </div>
            </div>
            <div className="bg-[#2D3A51]/77 rounded-lg p-4 text-left">
              <div className="text-slate-400 text-sm">Time</div>
              <div className="text-white font-bold text-lg">
                {currentEvent.time || 'All Night'}
              </div>
            </div>
            <div className="bg-[#2D3A51]/77 rounded-lg p-4 text-left">
              <div className="text-slate-400 text-sm">Visibility</div>
              <div className="text-white font-bold text-lg capitalize">
                {currentEvent.visibility || 'Excellent'}
              </div>
            </div>
          </div>
        </div>

        {/* Visibility Information */}
        <div className="bg-[#1E1E3C] rounded-xl p-6 border border-white/30 h-fit lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Visibility Information
          </h2>
          <div className='flex justify-center h-50 mb-3'>
            <div className='bg-[#1E1E3C] border border-white/30 rounded-lg w-full h-32 flex items-center justify-center'>
              <span className="text-slate-500 text-sm">Visibility Map</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-300">Fully Visible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-slate-300">Partially Visible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-slate-300">Not Visible</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className='bg-[#2D3A51] rounded-lg p-3'>
              <h3 className="text-md font-semibold text-[#9DACF1] text-left">Visibility Rating</h3>
              <div className="py-2 flex items-center gap-3">
                <div className='flex gap-0 w-full'>
                  <div className='w-full bg-green-600 h-1 rounded'></div>
                  <div className='w-20 bg-gray-600 h-1 rounded'></div>
                </div>
                <div className="text-green-400 font-medium">Excellent</div>
              </div>
              <div className="text-slate-300 text-sm text-left">
                Weather conditions are expected to be favorable for viewing from your location.
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-4 text-left">Best Viewing Regions</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">Middle East (excellent visibility)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">Asia (excellent visibility)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300">Europe (partial visibility)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300">Africa (partial visibility)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Event Timeline */}
        <div className="lg:col-start-1 lg:col-end-3 lg:row-start-2 lg:row-end-3 bg-[#1E1E3C] rounded-xl p-6 border border-white/30 h-fit">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            Event Timeline
          </h2>
          <div className="relative mb-8">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-1.5 rounded bg-gray-600"></div>
            <div className="flex justify-between relative">
              {timelineStages.map((stage, index) => (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full z-10 relative ${
                    stage.active 
                      ? 'bg-red-500 border-red-500' 
                      : 'bg-[#6366F1] border-black/20 border'
                  }`}></div>
                  <div className="text-sm text-slate-50 mt-4 text-center max-w-20">
                    {stage.time}
                  </div>
                  <div className="text-xs text-slate-50 mt-1 text-center max-w-20">
                    {stage.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2D3A51]/77 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <div className='mt-0.5'>
                <AlertCircle size={20} color={'#CEBE0C'}/>
              </div>
              <div className="text-white text-sm">
                {currentEvent.type === 'Moon Phase' 
                  ? `The ${currentEvent.title} will be visible throughout the night. This is an excellent time for lunar observation and photography.`
                  : `This ${currentEvent.type.toLowerCase()} will be visible from your location. Check local weather conditions for optimal viewing.`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Timezone Information */}
        <div className="bg-[#1E1E3C] rounded-xl p-6 border border-white/30 lg:col-start-3 lg:col-end-4 lg:row-start-3 lg:row-end-5 h-fit">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            Timezone Information
          </h2>
          
          <div className="mb-4">
            <label className="block text-slate-300 text-sm mb-2 text-left">Select your timezone:</label>
            <select 
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full bg-[#2D3A51]/77 rounded-lg px-3 py-2 mb-2 text-white focus:outline-none focus:border-blue-500"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-sm text-left bg-[#2D3A51] p-3 rounded-lg">
            <h3 className="text-[#9DACF1] font-medium mb-4">Event Times</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Event Date:</span>
                <span className="text-white">{formatDate(currentEvent.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Event Time:</span>
                <span className="text-white">{currentEvent.time || 'All Night'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Duration:</span>
                <span className="text-white">{currentEvent.duration || 'Variable'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Best Viewing:</span>
                <span className="text-white">After astronomical twilight</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Details */}
        <div className="lg:col-start-1 lg:col-end-3 lg:row-start-3 lg:row-end-5 bg-[#1E1E3C] rounded-xl p-6 border border-white/30 h-fit">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            Scientific Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-[#9DACF1] mb-4 text-left">Event Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Event Type:</span>
                  <span className="text-white">{currentEvent.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Visibility:</span>
                  <span className="text-white">{currentEvent.visibility || 'Excellent'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Constellation:</span>
                  <span className="text-white">{currentEvent.constellation || 'Various'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Magnitude:</span>
                  <span className="text-white">{currentEvent.magnitude || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#9DACF1] mb-4 text-left">Observing Tips</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Best Time:</span>
                  <span className="text-white">{currentEvent.time || 'Dark skies'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Equipment:</span>
                  <span className="text-white">Naked eye / Binoculars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Weather:</span>
                  <span className="text-white">Clear skies preferred</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Location:</span>
                  <span className="text-white">Away from city lights</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-700 rounded-xl p-4">
            <p className="text-slate-300 text-sm leading-relaxed text-left">
              {currentEvent.description || 
                `This ${currentEvent.type.toLowerCase()} presents an excellent opportunity for astronomical observation. 
                For the best viewing experience, find a location away from city lights and allow your eyes to adjust 
                to the darkness for about 20-30 minutes. Check local weather conditions and astronomical twilight times 
                for optimal viewing.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;