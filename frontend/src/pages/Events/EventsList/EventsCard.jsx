import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronDown, Search, Calendar, MapPin, Users, Clock, Star, Filter, ChevronLeft, ChevronRight, Bookmark, Share2, Eye, AlertCircle, ExternalLink, Copy, Download } from 'lucide-react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useImageLoader = (src) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setError(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setLoading(false);
      setError(false);
    };
    img.onerror = () => {
      setLoading(false);
      setError(true);
    };
    img.src = src;
  }, [src]);

  return { loading, error };
};

const EventsCard = ({ event, viewMode = 'grid', onBookmark, onShare, onView }) => {
  const [viewedEvents, setViewedEvents] = useLocalStorage('viewed-events', new Set());
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const { loading: imageLoading, error: imageLoadError } = useImageLoader(event.image);


  const isViewed = useMemo(() => {
    return viewedEvents.has ? viewedEvents.has(event.id) : viewedEvents.includes?.(event.id) || false;
  }, [viewedEvents, event.id]);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);



  const getEventTypeIcon = useCallback((type) => {
    switch (type?.toLowerCase()) {
      case 'eclipse': return '🌑';
      case 'meteor': return '☄️';
      case 'planetary': return '🪐';
      case 'conjunction': return '✨';
      case 'moon phase': return '🌙';
      default: return '🔭';
    }
  }, []);


  const handleShare = useCallback(async (e) => {
    e.stopPropagation();
    
    const shareData = {
      title: event.title,
      text: `Check out this astronomy event: ${event.title}`,
      url: window.location.href + `?event=${event.id}`
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        setShowShareMenu(true);
      }
      onShare?.(event.id);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setShowShareMenu(true);
      }
    }
  }, [event, onShare]);

  const copyToClipboard = useCallback(async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
      setShowShareMenu(false);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  }, []);

  const handleView = useCallback(() => {
    const newViewedEvents = new Set(viewedEvents);
    newViewedEvents.add(event.id);
    setViewedEvents(newViewedEvents);
    onView?.(event.id);
  }, [viewedEvents, event.id, onView, setViewedEvents]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.closest('.events-card') === e.currentTarget) {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            handleView();
            break;
          case 'b':
          case 'B':
            e.preventDefault();
            break;
          case 's':
          case 'S':
            e.preventDefault();
            handleShare(e);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleView, handleShare]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showShareMenu && !e.target.closest('.share-menu')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  const cardClasses = useMemo(() => {
    const baseClasses = "bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group events-card";
    
    if (viewMode === 'list') {
      return `${baseClasses} flex flex-row h-32`;
    }
    return baseClasses;
  }, [viewMode]);

  const imageClasses = useMemo(() => {
    if (viewMode === 'list') {
      return "w-48 h-32 object-cover group-hover:scale-105 transition-transform duration-300";
    }
    return "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300";
  }, [viewMode]);

  const contentClasses = useMemo(() => {
    if (viewMode === 'list') {
      return "flex-1 p-4";
    }
    return "p-6";
  }, [viewMode]);

  return (
    <div 
      className={cardClasses}
      tabIndex={0}
      role="article"
      aria-label={`Event: ${event.title}`}
      onClick={handleView}
    >
      {/* Image section */}
      <div className="relative overflow-hidden">
        {imageLoading ? (
          <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'} bg-slate-700 animate-pulse flex items-center justify-center`}>
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : imageLoadError || imageError ? (
          <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'} bg-slate-700 flex items-center justify-center`}>
            <div className="text-center text-white/50">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs">Image unavailable</p>
            </div>
          </div>
        ) : (
          <img 
            src={event.image} 
            alt={event.title}
            className={imageClasses}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {event.featured && (
            <span className="flex items-center gap-1 bg-yellow-600/90 text-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
          {isViewed && (
            <span className="flex items-center gap-1 bg-blue-600/90 text-blue-100 px-2 py-1 rounded-full text-xs font-medium">
              <Eye className="w-3 h-3" />
              Viewed
            </span>
          )}
        </div>

        

        {/* Action buttons overlay */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
          <div className="relative share-menu">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/50 text-white/70 hover:text-white backdrop-blur-sm transition-colors"
              aria-label="Share event"
              title="Share event (S)"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            {showShareMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-slate-800/95 backdrop-blur-sm border border-white/20 rounded-lg p-2 min-w-48 z-50">
                <div className="space-y-1">
                  <button
                    onClick={() => copyToClipboard(window.location.href + `?event=${event.id}`, 'url')}
                    className="w-full flex items-center gap-2 text-left text-white/70 hover:text-white p-2 rounded text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={() => copyToClipboard(event.title, 'title')}
                    className="w-full flex items-center gap-2 text-left text-white/70 hover:text-white p-2 rounded text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy Title
                  </button>
                  <button
                    onClick={() => {
                      const eventData = `${event.title}\n${event.description}\n${formatDate(event.date)} at ${event.time}\n${event.location}`;
                      copyToClipboard(eventData, 'details');
                    }}
                    className="w-full flex items-center gap-2 text-left text-white/70 hover:text-white p-2 rounded text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Copy Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={contentClasses}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 text-left flex-1">
            {event.title}
          </h3>
          <div className="ml-2 flex items-center gap-2 shrink-0">
            <span className="text-lg" title={`Event type: ${event.type}`}>
              {getEventTypeIcon(event.type)}
            </span>
            <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full capitalize border border-blue-600/30">
              {event.type}
            </span>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 text-left">
          {event.description}
        </p>
        
        <div className={`space-y-2 mb-4 ${viewMode === 'list' ? 'space-y-1' : ''}`}>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{formatDate(event.date)} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.constellation && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Star className="w-4 h-4 shrink-0" />
              <span>In {event.constellation}</span>
            </div>
          )}
          {event.magnitude && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-4 h-4 rounded-full bg-yellow-400/60 shrink-0" />
              <span>Magnitude: {event.magnitude}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            {shareSuccess && (
              <span className="text-green-400 text-xs animate-fade-in">
                ✓ Copied!
              </span>
            )}
          </div>
          
          <button 
            onClick={handleView}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label={`View details for ${event.title}`}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsCard;

