import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Calendar, FileText, Search, X, Filter, SortAsc, SortDesc, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import EventsCard from '../Events/EventsList/EventsCard';

// Custom hooks for better state management
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Mock data generator for demonstration
const generateMockEvents = (year, eventType) => {
  const eventTypes = ['Lunar Events', 'Solar Events', 'Meteor Events', 'Planetary', 'Eclipses', 'Special Events'];
  const events = [];
  
  const eventTemplates = {
    'Lunar Events': [
      { title: 'Full Moon', description: 'Full moon visible all night', icon: '🌕' },
      { title: 'New Moon', description: 'New moon phase begins', icon: '🌑' },
      { title: 'Lunar Eclipse', description: 'Partial lunar eclipse visible', icon: '🌘' },
      { title: 'Supermoon', description: 'Moon appears larger than usual', icon: '🌕' }
    ],
    'Solar Events': [
      { title: 'Solar Eclipse', description: 'Partial solar eclipse', icon: '🌞' },
      { title: 'Solar Flare', description: 'Increased solar activity', icon: '☀️' },
      { title: 'Equinox', description: 'Day and night equal length', icon: '🌅' },
      { title: 'Solstice', description: 'Longest or shortest day', icon: '🌄' }
    ],
    'Meteor Events': [
      { title: 'Perseid Meteor Shower', description: 'Peak meteor activity', icon: '☄️' },
      { title: 'Geminid Meteor Shower', description: 'Annual meteor shower', icon: '🌠' },
      { title: 'Leonid Meteor Shower', description: 'Meteor shower from Leo', icon: '☄️' },
      { title: 'Quadrantid Meteor Shower', description: 'First meteor shower of year', icon: '🌠' }
    ],
    'Planetary': [
      { title: 'Mars Opposition', description: 'Mars closest to Earth', icon: '🔴' },
      { title: 'Jupiter Conjunction', description: 'Jupiter aligns with other planets', icon: '🪐' },
      { title: 'Venus Transit', description: 'Venus crosses the sun', icon: '♀️' },
      { title: 'Saturn Rings Visible', description: 'Best time to view Saturn rings', icon: '🪐' }
    ],
    'Eclipses': [
      { title: 'Total Solar Eclipse', description: 'Complete solar eclipse', icon: '🌑' },
      { title: 'Partial Lunar Eclipse', description: 'Partial lunar eclipse', icon: '🌘' },
      { title: 'Annular Solar Eclipse', description: 'Ring of fire eclipse', icon: '💍' },
      { title: 'Penumbral Lunar Eclipse', description: 'Subtle lunar eclipse', icon: '🌖' }
    ],
    'Special Events': [
      { title: 'International Space Station Pass', description: 'ISS visible overhead', icon: '🛰️' },
      { title: 'Comet Visibility', description: 'Comet visible to naked eye', icon: '☄️' },
      { title: 'Planetary Alignment', description: 'Multiple planets align', icon: '🌌' },
      { title: 'Aurora Activity', description: 'Northern lights visible', icon: '🌌' }
    ]
  };

  const typesToGenerate = eventType === 'All Events' ? eventTypes : [eventType];
  
  typesToGenerate.forEach(type => {
    const templates = eventTemplates[type] || [];
    const eventsPerType = Math.floor(Math.random() * 8) + 3; // 3-10 events per type
    
    for (let i = 0; i < eventsPerType; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 24);
      
      events.push({
        id: `${year}-${type}-${i}`,
        title: template.title,
        description: template.description,
        date: new Date(year, month - 1, day, hour).toISOString(),
        type: type,
        tags: [type.replace(' Events', ''), 'Archive'],
        icon: template.icon,
        visibility: Math.random() > 0.3 ? 'Excellent' : 'Good',
        magnitude: type === 'Planetary' ? (Math.random() * 5 - 2).toFixed(1) : null,
        duration: type.includes('Eclipse') ? `${Math.floor(Math.random() * 180) + 30} minutes` : null,
        location: Math.random() > 0.5 ? 'Worldwide' : 'Northern Hemisphere',
        year: year
      });
    }
  });

  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const Archive = () => {
  // State management with improved structure
  const [selectedYear, setSelectedYear] = useLocalStorage('archive-selected-year', 2025);
  const [selectedEventType, setSelectedEventType] = useLocalStorage('archive-event-type', 'All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useLocalStorage('archive-sort-by', 'date-newest');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Refs for DOM manipulation
  const yearSliderRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Constants
  const currentYear = 2026;
  const years = Array.from({ length: currentYear - 2000 }, (_, i) => 2000 + i).reverse();

  const eventTypes = [
    { name: 'All Events', icon: '✨', emoji: '✨' },
    { name: 'Lunar Events', icon: '🌙', emoji: '🌙' },
    { name: 'Solar Events', icon: '☀️', emoji: '☀️' },
    { name: 'Meteor Events', icon: '☄️', emoji: '☄️' },
    { name: 'Planetary', icon: '🪐', emoji: '🪐' },
    { name: 'Eclipses', icon: '🌘', emoji: '🌘' },
    { name: 'Special Events', icon: '🚀', emoji: '🚀' }
  ];

  const sortOptions = [
    { value: 'date-newest', label: 'Date (Newest)', icon: SortDesc },
    { value: 'date-oldest', label: 'Date (Oldest)', icon: SortAsc },
    { value: 'name-asc', label: 'Name (A-Z)', icon: SortAsc },
    { value: 'name-desc', label: 'Name (Z-A)', icon: SortDesc },
    { value: 'type', label: 'Event Type', icon: Filter }
  ];

  // Generate events data based on current filters
  const allEvents = useMemo(() => {
    return generateMockEvents(selectedYear, selectedEventType);
  }, [selectedYear, selectedEventType]);

  // Get all unique tags for filtering
  const allTags = useMemo(() => {
    const tags = new Set();
    allEvents.forEach(event => {
      event.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [allEvents]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = allEvents;

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query) ||
        event.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTags.size > 0) {
      filtered = filtered.filter(event =>
        event.tags?.some(tag => selectedTags.has(tag))
      );
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        return true;
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-newest':
          return new Date(b.date) - new Date(a.date);
        case 'date-oldest':
          return new Date(a.date) - new Date(b.date);
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return sorted;
  }, [allEvents, debouncedSearchQuery, selectedTags, dateRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedEventType, debouncedSearchQuery, selectedTags, dateRange, sortBy]);

  // Simulate loading when changing major filters
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, Math.random() * 500 + 200); // 200-700ms loading time

    return () => clearTimeout(timer);
  }, [selectedYear, selectedEventType]);

  // Event handlers
  const handleYearChange = useCallback((year) => {
    setSelectedYear(year);
  }, [setSelectedYear]);

  const handleEventTypeChange = useCallback((eventType) => {
    setSelectedEventType(eventType);
  }, [setSelectedEventType]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, [setSortBy]);

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags(new Set());
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
  }, []);

  const slideYears = useCallback((direction) => {
    const container = yearSliderRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const scrollYears = useCallback((direction) => {
    const currentIndex = years.indexOf(selectedYear);
    if (direction === 'left' && currentIndex > 0) {
      handleYearChange(years[currentIndex - 1]);
    } else if (direction === 'right' && currentIndex < years.length - 1) {
      handleYearChange(years[currentIndex + 1]);
    }
  }, [years, selectedYear, handleYearChange]);

  const exportData = useCallback(() => {
    try {
      const dataToExport = {
        year: selectedYear,
        eventType: selectedEventType,
        totalEvents: filteredAndSortedEvents.length,
        events: filteredAndSortedEvents.map(event => ({
          title: event.title,
          description: event.description,
          date: event.date,
          type: event.type,
          location: event.location,
          visibility: event.visibility
        })),
        exportDate: new Date().toISOString(),
        filters: {
          searchQuery: debouncedSearchQuery,
          selectedTags: Array.from(selectedTags),
          dateRange,
          sortBy
        }
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `astronomy-archive-${selectedYear}-${selectedEventType.replace(' ', '-').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export data. Please try again.');
      console.error('Export error:', error);
    }
  }, [selectedYear, selectedEventType, filteredAndSortedEvents, debouncedSearchQuery, selectedTags, dateRange, sortBy]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          scrollYears('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          scrollYears('right');
          break;
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'Escape':
          if (searchQuery) {
            clearSearch();
          } else if (showAdvancedFilters) {
            setShowAdvancedFilters(false);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [scrollYears, searchQuery, clearSearch, showAdvancedFilters]);

  return (
    <div className="min-h-screen mt-10 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Enhanced Search and Filters Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-100">Event Archive</h1>
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search events... (Press / to focus)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-10 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                showAdvancedFilters || selectedTags.size > 0 || dateRange.start || dateRange.end
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
              {(selectedTags.size > 0 || dateRange.start || dateRange.end) && (
                <span className="bg-purple-400 text-purple-900 text-xs px-2 py-1 rounded-full">
                  {selectedTags.size + (dateRange.start || dateRange.end ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tag Filters */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Filter by Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                          selectedTags.has(tag)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Date Range</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedTags.size > 0 || dateRange.start || dateRange.end || searchQuery) && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
            <span>
              Showing {paginatedEvents.length} of {filteredAndSortedEvents.length} events
              {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
            </span>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Year Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-gray-100">Select Year</h2>
          
          <div className="relative rounded-2xl p-8 backdrop-blur-sm">
            {/* Timeline Line */}
            <div className="absolute top-3/8 left-4 right-4 h-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 transform -translate-y-1/2"></div>
            
            <div 
              ref={yearSliderRef}
              id="year-slider" 
              className="flex items-center justify-between relative z-10 scrollbar-hide px-10 py-10 overflow-x-auto gap-15"
            >
              {years.map((year, index) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`relative group transition-all duration-300 transform ${
                    selectedYear === year 
                      ? 'scale-110' 
                      : 'hover:scale-105'
                  }`}
                  aria-label={`Select year ${year}`}
                  aria-pressed={selectedYear === year}
                >
                  {/* Glow effect for selected year */}
                  {selectedYear === year && (
                    <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl scale-150 animate-pulse"></div>
                  )}
                  
                  {/* Year dot */}
                  <div className={`relative w-8 h-8 rounded-full mb-4 mx-auto transition-all duration-300 ${
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
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'border border-white hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transform hover:scale-105'
                }`}
                aria-label="Previous year"
              >
                <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
              </button>
              <button 
                onClick={() => scrollYears('right')}
                disabled={selectedYear === years[years.length - 1]}
                className={`group p-3 rounded-full transition-all duration-300 ${
                  selectedYear === years[years.length - 1]
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'border border-white hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transform hover:scale-105'
                }`}
                aria-label="Next year"
              >
                <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Event Type Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Filter by Event Type</h2>
          
          <div className="grid grid-cols-7 gap-3">
            {eventTypes.map((eventType) => (
              <button
                key={eventType.name}
                onClick={() => handleEventTypeChange(eventType.name)}
                className={`p-4 py-7 rounded-lg border-2 transition-all duration-200 ${
                  selectedEventType === eventType.name
                    ? 'border-[#4E2798] bg-[#211444]/69'
                    : 'border-white/20 bg-[#232151]/65 hover:border-purple-500 hover:bg-purple-900/20'
                }`}
                aria-label={`Filter by ${eventType.name}`}
                aria-pressed={selectedEventType === eventType.name}
              >
                <div className="text-6xl mb-10">{eventType.emoji}</div>
                <div className="text-md font-bold text-center">{eventType.name}</div>
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
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={exportData}
                disabled={filteredAndSortedEvents.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Export Data</span>
              </button>
            </div>
          </div>
          
          {/* Error State */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-gray-800/30 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedEvents.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No events found</h3>
              <p className="text-gray-400 mb-4">
                {debouncedSearchQuery || selectedTags.size > 0 || dateRange.start || dateRange.end
                  ? 'Try adjusting your filters or search terms'
                  : `No events available for ${selectedYear} in ${selectedEventType}`
                }
              </p>
              {(debouncedSearchQuery || selectedTags.size > 0 || dateRange.start || dateRange.end) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            /* Results Grid */
            <>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {paginatedEvents.map((result) => (
                  <EventsCard key={result.id} event={result} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Archive;

