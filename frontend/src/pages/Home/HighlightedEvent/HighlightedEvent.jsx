import { Clock, MapPin, Eye, Star, Calendar, Share2, Bookmark } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import './HighlightedEvent.css';
import MoonImage from '../../../assets/SVG/MoonImage';
import Button from '../../../components/common/Button/Button';
import Badges from '../../../components/common/Badges/Badges';

const HighlightedEvent = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 18,
    seconds: 35
  });
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const shareOptions = [
    { name: 'Copy Link', action: () => navigator.clipboard.writeText(window.location.href) },
    { name: 'Twitter', action: () => window.open('https://twitter.com/intent/tweet?text=Check out this amazing lunar event!') },
    { name: 'Facebook', action: () => window.open('https://facebook.com/sharer/sharer.php?u=' + window.location.href) }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8">
      <div className="card-background rounded-3xl px-8 py-6 text-white relative overflow-hidden">

        <Badges variant='primary' showDot={false}>
              <span className="flex items-center gap-2">
                Happening Now
              </span>
            </Badges>

        <div className="grid lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-grotesk-font">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-left bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Highlight of the Day
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400/20 to-purple-600/20 border border-white/20">
                  <MoonImage />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-semibold">Moon at First Quarter</h3>
                  <p className="text-purple-200/80 text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Today, June 3, 2025
                  </p>
                </div>
              </div>
            </div>

              <p className="text-purple-100 leading-relaxed text-left text-[14px] space-grotesk-font">
                The Moon reaches its First Quarter phase today, appearing exactly half-illuminated from Earth. 
                This phase marks the halfway point between the New Moon and Full Moon, creating perfect 
                conditions for observing lunar features along the terminator (the line between light and dark).
              </p>
        

            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-300 space-grotesk-font text-left">
              <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium">Best Viewing</div>
                  <div className="text-xs text-gray-300">Evening until midnight</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <MapPin className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-medium">Direction</div>
                  <div className="text-xs text-gray-300">Southern sky</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 backdrop-blur-sm">
                <Eye className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium">Conditions</div>
                  <div className="text-xs text-gray-300">Clear skies predicted</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 space-grotesk-font ">
              <Button 
                variant="primary" 
                className='px-9 flex items-center button-gradient-new button-gradient-hover transform hover:scale-105 transition-all duration-300'
              >
                <Calendar className="w-4 h-4 mr-2" />
                Set Reminder
              </Button>
              <Button 
                variant="secondary" 
                className='px-9 py-2 hover:bg-white/10 transform hover:scale-105 transition-all duration-300'
              >
                View Details
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-background backdrop-blur-sm rounded-2xl p-6 relative overflow-hidden mt-10">
              <div className="bg-[url(https://images-assets.nasa.gov/image/NHQ201907180120/NHQ201907180120~small.jpg)] bg-cover bg-center w-full h-48 lg:h-56 rounded-2xl flex items-end justify-center p-4  relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="text-center relative z-10">
                  <p className="text-white/90 text-sm mb-3 space-grotesk-font-bold font-semibold">
                    Time until peak visibility:
                  </p>
                  <div className={`flex justify-center gap-2 transition-all duration-300`}>
                    <div className="text-center min-w-[3rem] card-background/80 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                      <div className="text-2xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-gray-300">Hours</div>
                    </div>
                    <div className="text-center min-w-[3rem] card-background/80 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                      <div className="text-2xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-gray-300">Mins</div>
                    </div>
                    <div className="text-center min-w-[3rem] card-background/80 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                      <div className="text-2xl font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                      <div className="text-xs text-gray-300">Secs</div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedEvent;

