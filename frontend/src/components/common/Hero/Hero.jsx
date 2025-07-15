import { Link } from 'react-router-dom';
import Badges from '../Badges/Badges';
import { Calendar, Dot, Clock, Share2 } from 'lucide-react';
import Button from '../Button/Button';
import useEvents from '../../../hooks/useEvents';

const Hero = ({ Background, title, subtitle, showButton = true, ButtonText, EventsPage = false, eventId }) => {
  const { events, loading, error, getEventById } = useEvents();

  const currentEvent = getEventById(eventId);

  if (EventsPage) {
    if (loading) {
      return (
        <section
          className="relative my-4 w-screen h-[35vh] md:h-[50vh] bg-cover bg-right bg-fixed flex flex-col items-center justify-center text-center text-white"
          style={{ backgroundImage: `url(${Background})` }}
        >
          <div className="inline-block">
            <h1 className="pt-5 text-2xl sm:text-3xl md:text-[40px] font-semibold tracking-wide mb-3 font-[Orbitron] uppercase">
              Loading Event...
            </h1>
          </div>
        </section>
      );
    }

    if (error || !currentEvent) {
      return (
        <section
          className="relative my-4 w-screen h-[35vh] md:h-[50vh] bg-cover bg-right bg-fixed flex flex-col items-center justify-center text-center text-white"
          style={{ backgroundImage: `url(${Background})` }}
        >
          <div className="inline-block">
            <h1 className="pt-5 text-2xl sm:text-3xl md:text-[40px] font-semibold tracking-wide mb-3 font-[Orbitron] uppercase">
              {title}
            </h1>
            <p className="text-lg text-red-400">Event not found</p>
          </div>
        </section>
      );
    }

    return (
      <section
        className="relative my-4 w-screen h-[35vh] md:h-[50vh] bg-cover bg-right bg-fixed flex flex-col items-center justify-center text-center text-white"
        style={{ backgroundImage: `url(${Background})` }}
      >
        <Badges variant={currentEvent.color} showDot={false} className='capitalize font-medium mt-3'>
          {currentEvent.type}
        </Badges>
        <div className="inline-block">
          <h1 className="pt-5 text-2xl sm:text-3xl md:text-[40px] font-semibold tracking-wide mb-3 font-[Orbitron] uppercase">
            {title}
          </h1>
          <div className='flex items-center justify-center mb-3 gap-2'>
            <Calendar size={25} />
            <p className="text-lg sm:text-xl md:text-xl font-normal space-grotesk-font">
              {currentEvent.date instanceof Date 
                ? currentEvent.date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : new Date(currentEvent.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
              }
            </p>
            {currentEvent.start_time && currentEvent.end_time && (
              <>
                <Dot size={60} />
                <Clock />
                <p className="text-lg sm:text-xl md:text-xl font-normal space-grotesk-font">
                  {currentEvent.start_time} - {currentEvent.end_time}
                </p>
              </>
            )}
          </div>
          {showButton && (
            <div className='flex justify-center gap-2 w-200'>
              <Button className="flex gap-4 justify-center items-center text-base px-6 sm:px-8 md:px-2 py-2 space-grotesk-font-bold button-gradient text-white rounded-xl sm:text-xl md:text-xl w-1/3">
                <Calendar />
                Add to Calendar
              </Button>
              <Button className="flex justify-center items-center text-base px-6 sm:px-8 md:px-2 py-2 space-grotesk-font-bold button-gradient text-white rounded-xl sm:text-xl md:text-xl w-1/17">
                <Share2 />
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative my-4 w-screen h-[35vh] md:h-[50vh] bg-cover bg-bottom bg-fixed flex flex-col items-center justify-center text-center text-white"
      style={{ backgroundImage: `url(${Background})` }}
    >
      <div className="p-6 inline-block">
        <h1 className="pt-8 text-2xl sm:text-3xl md:text-[43px] font-semibold tracking-wide mb-6 font-[Orbitron] uppercase">
          {title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-9 font-normal space-grotesk-font">
          {subtitle}
        </p>
        {showButton && (
          <Link
            to="/Calendar"
            className="text-base w-[40px] md:w-[305px] h-[50px] px-6 sm:px-8 md:px-14 py-2 space-grotesk-font-bold button-gradient text-white rounded-full sm:text-xl md:text-2xl"
          >
            {ButtonText}
          </Link>
        )}
      </div>
    </section>
  );
};

export default Hero;