import React, { useState } from 'react';
import Badges from '../../../components/common/Badges/Badges';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  Bookmark, 
  Share2, 
  Eye,
  Star
} from 'lucide-react';

const EventsCard = ({ 
  title, 
  date, 
  description, 
  badge, 
  badgeColor, 
  image, 
  viewMode = 'grid'
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.href
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en', { month: 'short' }),
      time: date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const parsedDate = formatDate(date);


  return (
    <div 
      className={`bg-[#1E1E3C]/80 backdrop-blur-sm p-6 h-[100%] rounded-xl border transition-all duration-500 space-grotesk-font group cursor-pointer transform hover:scale-105`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badges variant={badgeColor} className="flex-shrink-0" showDot={false}>
              {badge}
            </Badges>
          </div>
          
          <h3 className="text-xl font-semibold text-left mb-2 group-hover:text-blue-300 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {parsedDate.day} {parsedDate.month}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {parsedDate.time}
            </span>
          </div>
        </div>

        <div className={`flex gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-lg bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-lg">
        <div className={`w-full h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg transition-all duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <img 
          src={image} 
          alt={title} 
          className={`absolute inset-0 w-full h-32 object-cover rounded-lg transition-all duration-500 ${
            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
        />
        
      </div>

      <p className="text-sm text-left text-gray-300 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-between">
        <a 
          href="#" 
          className="text-[#818CF8] font-medium hover:underline text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
        >
          More Details 
          <ChevronRight className="w-4 h-4" />
        </a>
        
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Clear
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Global
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventsCard;

