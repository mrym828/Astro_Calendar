import { Clock, MapPin, Eye } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import './HighlightedEvent.css'
import MoonImage from '../../../assets/SVG/MoonImage'
import Button from '../../../components/common/Button/Button'
import Badges from '../../../components/common/Badges/Badges';

const HighlightedEvent = () =>{
    const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 18,
    seconds: 35
  });

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

    return(
        <div className="max-w-18/19 mx-auto p-6 mt-14">
      <div className="card-background rounded-2xl px-6 py-2 text-white relative overflow-hidden flex">
        <Badges variant='primary'>Happening Now</Badges>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
        </div>
        <div className="w-2/3">
        {/* Header */}
        <div className="flex justify-between items-start mb-2 relative space-grotesk-font">
          <div>
            <h2 className="text-[32px] font-medium mb-3 text-left ">Highlight of the Day</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-20 h-10  rounded-full flex items-center justify-center">
                  <MoonImage />
              </div>
              <div>
                <h2 className="text-2xl font-medium">Moon at First Quarter</h2>
                <p className="text-purple-200/80 text-sm text-left">Today, June 3, 2025</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 relative z-10">
          <div className="flex-1 px-2">
            <p className="text-purple-100 mb-4 leading-relaxed text-left text-sm space-grotesk-font">
              The Moon reaches its First Quarter phase today, appearing exactly half-illuminated from Earth. 
              This phase marks the halfway point between the New Moon and Full Moon, creating perfect 
              conditions for observing lunar features along the terminator (the line between light and dark).
            </p>
            <div className="flex flex-wrap gap-4 mb-5 text-sm text-blue-300 space-grotesk-font">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Best viewing: evening until midnight</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Look toward southern sky</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>Clear skies predicted</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 space-grotesk-font py-1">
              <Button variant="primary" className='w-55 button-gradient-new button-gradient-hover'>
                Set Reminder
              </Button>
              <Button variant="secondary" className='w-55 hover:bg-white/10'>
                View more
              </Button>
            </div>
          </div>
        </div>
        </div>
        {/* Right content - Moon and countdown */}
        <div>
          <div className="flex-shrink-0">
            <div className="card-background backdrop-blur-sm rounded-2xl p-6 w-99 h-[42vh] mt-6 mx-3 relative items-center">
              {/* Moon image */}
              <div className='bg-[url(https://images-assets.nasa.gov/image/NHQ201907180120/NHQ201907180120~small.jpg)] w-86 h-57 rounded-2xl flex items-end justify-center p-3'>
              {/* Countdown */}
              <div className="text-center">
                <p className="text-white/75 text-sm mb-1 space-grotesk-font-bold"
>Time until peak visibility:</p>
                <div className="flex justify-center gap-2">
                  <div className="text-center w-15 card-background p-2 rounded-2xl">
                    <div className="text-2xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Hours</div>
                  </div>
                  <div className="text-center w-15 card-background p-2 rounded-2xl">
                    <div className="text-2xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Mins</div>
                  </div>
                  <div className="text-center w-15 card-background p-2 rounded-2xl">
                    <div className="text-2xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Secs</div>
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