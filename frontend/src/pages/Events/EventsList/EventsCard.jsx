import { ChevronDown, Search, Calendar, MapPin, Users, Clock, Star, Filter, ChevronLeft, ChevronRight } from 'lucide-react';


const EventsCard = ({ event }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'public': return 'bg-green-600/20 text-green-300 border-green-600/30';
      case 'private': return 'bg-red-600/20 text-red-300 border-red-600/30';
      case 'members': return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group">
      <div className="relative overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {event.featured && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 bg-yellow-600/90 text-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVisibilityColor(event.visibility)} backdrop-blur-sm capitalize`}>
            {event.visibility}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 text-left">
            {event.title}
          </h3>
          <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full capitalize shrink-0 border border-blue-600/30">
            {event.type}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 text-left">
          {event.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          {event.constellation && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Star className="w-4 h-4" />
              <span>In {event.constellation}</span>
            </div>
          )}
          {event.magnitude && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 rounded-full bg-yellow-400/60" />
              <span>Magnitude: {event.magnitude}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
export default EventsCard