import React, { useState, useEffect } from 'react';
import HighlightedEvent from './HighlightedEvent/HighlightedEvent';
import UpcomingEvents from './UpcomingEvents/UpcomingEvents';
import Newsletters from './Newsletters/Newsletters';
import SunDataList from './SunData';
import { ChevronUp, Loader2 } from 'lucide-react';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg">Loading celestial wonders...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="home-container min-h-screen  relative">
      

      {/* Main content */}
      <div className="relative z-10">
        <section className="pt-8 pb-4">
          <HighlightedEvent />
        </section>

        {/* Upcoming Events section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <UpcomingEvents />
          </div>
        </section>

        {/* Newsletter section */}
        <section className="py-12">
          <Newsletters />
        </section>

    </div>
       
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Floating action for mobile */}
      <div className="fixed bottom-20 right-4 md:hidden">
        <div className="bg-blue-600 text-white p-3 rounded-full shadow-lg">
          <span className="text-sm font-medium">🌙 Tonight's Events</span>
        </div>
      </div>
    </main>
  );
};

export default Home;

