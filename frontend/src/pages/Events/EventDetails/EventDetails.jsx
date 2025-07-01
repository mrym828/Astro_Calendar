import React, { useState } from 'react';
import { Clock, MapPin, Eye, Calendar, Globe, Moon, Sun, ArrowLeft, Users, MapPin as Location, AlertCircle } from 'lucide-react';
import { mockEvents } from '../EventsList/EventsList';

const EventDetail = ({ eventId , onBack }) => {
  const [selectedTimezone, setSelectedTimezone] = useState('Eastern Daylight Time (UTC-4)');
  
  const currentEvent = mockEvents.find(event => event.id === parseInt(eventId)) || mockEvents[1]; // fallback to lunar eclipse


  // Generate timeline stages based on event type
  const getTimelineStages = (eventType, eventTime) => {
    const baseTime = new Date(`2025-06-15 ${eventTime}`);
    
    switch(eventType) {
      case 'eclipse':
        return [
          { id: 1, time: '9:07 PM', label: 'Penumbral Eclipse Begins', active: false },
          { id: 2, time: '10:45 PM', label: 'Partial Eclipse Begins', active: false },
          { id: 3, time: '12:11 AM', label: 'Total Eclipse Begins', active: true },
          { id: 4, time: '1:26 AM', label: 'Maximum Eclipse', active: false },
          { id: 5, time: '2:42 AM', label: 'Eclipse Ends', active: false }
        ];
      case 'meteor shower':
        return [
          { id: 1, time: '9:00 PM', label: 'Shower Begins', active: false },
          { id: 2, time: '11:00 PM', label: 'Activity Increases', active: false },
          { id: 3, time: '2:00 AM', label: 'Peak Activity', active: true },
          { id: 4, time: '4:00 AM', label: 'Activity Decreases', active: false },
          { id: 5, time: '6:00 AM', label: 'Dawn Ends Viewing', active: false }
        ];
      case 'planetary':
        return [
          { id: 1, time: '7:00 PM', label: 'Planet Rises', active: false },
          { id: 2, time: '9:00 PM', label: 'Best Viewing Begins', active: false },
          { id: 3, time: '11:00 PM', label: 'Optimal Position', active: true },
          { id: 4, time: '2:00 AM', label: 'Still Visible', active: false },
          { id: 5, time: '5:00 AM', label: 'Sets in West', active: false }
        ];
      default:
        return [
          { id: 1, time: eventTime, label: 'Event Begins', active: true }
        ];
    }
  };

  const timelineStages = getTimelineStages(currentEvent.type, currentEvent.time);

  const timezoneOptions = [
    'Eastern Daylight Time (UTC-4)',
    'Central Daylight Time (UTC-5)',
    'Mountain Daylight Time (UTC-6)',
    'Pacific Daylight Time (UTC-7)',
    'Gulf Standard Time (UTC+4)' ,
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
      case 'eclipse': return <Moon className="text-orange-400" />;
      case 'meteor shower': return <Sun className="text-yellow-400" />;
      case 'planetary': return <Globe className="text-blue-400" />;
      case 'conjunction': return <Eye className="text-purple-400" />;
      case 'comet': return <Clock className="text-green-400" />;
      case 'satellite': return <MapPin className="text-red-400" />;
      default: return <Calendar className="text-gray-400" />;
    }
};
    if (!currentEvent) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-slate-300 mb-6">The event you're looking for doesn't exist.</p>
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
          <h2 className="text-2xl font-bold text-white mb-9 text-left">
            Event Overview
          </h2>
          <p className="text-slate-300 mb-6 leading-relaxed text-left">
            {currentEvent.description}
          </p>
          
          <div className="grid grid-cols-3  gap-4">
            <div className="bg-[#2D3A51]/77 rounded-lg p-4">
              <div className="text-[#9DACF1] text-left text-sm">Duration</div>
              <div className="text-white font-bold text-lg text-left">{currentEvent.duration}</div>
            </div>
            <div className="bg-[#2D3A51]/77 rounded-lg p-4 text-left">
              <div className="text-slate-400 text-sm">Constellation</div>
              <div className="text-white font-bold text-lg">{currentEvent.constellation}</div>
            </div>
            <div className="bg-[#2D3A51]/77 rounded-lg p-4 text-left">
              <div className="text-slate-400 text-sm">Totality</div>
              <div className="text-white font-bold text-lg capitalize">{currentEvent.visibility}</div>
            </div>
          </div>
        </div>

        {/* Visibility Information */}
        <div className="bg-[#1E1E3C] rounded-xl p-6 border border-white/30 h-fit lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-3">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Visibility Information
          </h2>
          <div className='flex justify-center h-50 mb-3'>
          <div className='bg-[#1E1E3C] border border-white/30 rounded-lg w-full'>
          {/*visibility-map*/}
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
            <div className=" py-2 flex items-center gap-3">
            <div className='flex gap-0 w-full'>
                {/**progress bar for rating */}
            <div className='w-full bg-green-600 h-1 rounded'></div>
            <div className='w-20 bg-gray-600 h-1 rounded'></div>
            </div>
            <div className="text-green-400 font-medium">Excellent</div>
            </div>
            <div className="text-slate-300 text-sm text-left">Weather conditions are expected to be favorable for most viewing locations.</div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-4 text-left">Best Viewing Regions</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">North America (centre eclipse)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-slate-300">South America (centre eclipse)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300">Eastern Europe (partial eclipse)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-slate-300">Western Africa (partial eclipse)</span>
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
                <div key={stage.id} className="flex flex-col items-center ">
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
                The eclipse will be visible in its entirety from North and South America, as well as parts of 
                Europe and Africa. The Moon will appear red during totality due to sunlight filtering through 
                Earth's atmosphere.
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
              className="w-full bg-[#2D3A51]/77  rounded-lg px-3 py-2 mb-2 text-white focus:outline-none focus:border-blue-500"
            >
              {timezoneOptions.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-sm text-left bg-[#2D3A51] p-3 rounded-lg">
            <h3 className="text-[#9DACF1] font-medium mb-4">Event Times (EDT)</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Penumbral Eclipse Begins:</span>
                <span className="text-white">9:09 PM, June 15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Partial Eclipse Begins:</span>
                <span className="text-white">10:27 PM, June 15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Eclipse Begins:</span>
                <span className="text-white">11:41 PM, June 15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Maximum Eclipse:</span>
                <span className="text-white">12:25 AM, June 16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Total Eclipse Ends:</span>
                <span className="text-white">1:09 AM, June 16</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Partial Eclipse Ends:</span>
                <span className="text-white">2:03 AM, June 16</span>
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
              <h3 className="text-lg font-medium text-[#9DACF1] mb-4 text-left">Astronomical Data</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Umbral Magnitude:</span>
                  <span className="text-white">1.413</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Penumbral Magnitude:</span>
                  <span className="text-white">2.375</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Gamma Value:</span>
                  <span className="text-white">0.361</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Saros Series:</span>
                  <span className="text-white">131 (64 of 72)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-[#9DACF1] mb-4 text-left">Lunar Coordinates</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Right Ascension:</span>
                  <span className="text-white">1.413</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Declination:</span>
                  <span className="text-white">-19° 24'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Lunar Phase:</span>
                  <span className="text-white">Full Moon</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Distance from Earth:</span>
                  <span className="text-white">362,157 km</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-700 rounded-xl p-4">
            <p className="text-slate-300 text-sm leading-relaxed text-left">
              This eclipse belongs to Saros series 131, which contains 72 eclipses. The Moon's apparent diameter 
              will be 36.7 arcminutes, appearing slightly larger than average due to its proximity to perigee. The 
              umbral eclipse magnitude of 1.413 indicates that the Moon will be well within the umbra, creating a 
              spectacular deep red coloration that can last for over an hour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;