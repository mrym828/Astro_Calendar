import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Download, FileText, Grid, List, ChevronDown, Eye, Calendar, Filter, X, Clock, Star,RefreshCw, AlertCircle, Loader2, ChevronLeft, ChevronRight, TrendingUp, History } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Custom hooks for better functionality
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

const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useLocalStorage('search-history', []);

  const addToHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.term !== searchTerm);
      const newHistory = [
        { term: searchTerm, timestamp: Date.now() },
        ...filtered
      ].slice(0, 10); // Keep only last 10 searches
      return newHistory;
    });
  }, [setSearchHistory]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, [setSearchHistory]);

  return { searchHistory, addToHistory, clearHistory };
};

// Enhanced data generator with more realistic astronomy data
const generateEnhancedCelestialData = () => {
  const baseData = [
    {
      id: 1, date: '2025-01-25', object: 'Andromeda Galaxy', type: 'Galaxy', telescope: 'Hubble',
      visibility: 'High', eventType: 'observation', coordinates: { ra: '00h 42m 44s', dec: '+41° 16\' 09"' },
      magnitude: 3.4, constellation: 'Andromeda', distance: '2.5 million ly', discoverer: 'Abd al-Rahman al-Sufi'
    },
    {
      id: 2, date: '2024-09-16', object: 'Crab Nebula', type: 'Nebula', telescope: 'James Webb',
      visibility: 'Medium', eventType: 'observation', coordinates: { ra: '05h 34m 31s', dec: '+22° 00\' 52"' },
      magnitude: 8.4, constellation: 'Taurus', distance: '6,500 ly', discoverer: 'John Bevis'
    },
    {
      id: 3, date: '2024-08-12', object: 'Jupiter', type: 'Planet', telescope: 'Kepler',
      visibility: 'Low', eventType: 'transit', coordinates: { ra: '23h 15m 20s', dec: '-05° 30\' 15"' },
      magnitude: -2.1, constellation: 'Aquarius', distance: '390.4 million mi', discoverer: 'Ancient'
    },
    {
      id: 4, date: '2024-07-08', object: 'Orion Nebula', type: 'Nebula', telescope: 'Hubble',
      visibility: 'Medium', eventType: 'observation', coordinates: { ra: '05h 35m 12s', dec: '-05° 23\' 14"' },
      magnitude: 4.0, constellation: 'Orion', distance: '1,344 ly', discoverer: 'Nicolas-Claude Fabri de Peiresc'
    },
    {
      id: 5, date: '2024-06-15', object: 'Venus Transit', type: 'Planet', telescope: 'James Webb',
      visibility: 'High', eventType: 'transit', coordinates: { ra: '12h 30m 45s', dec: '+15° 45\' 30"' },
      magnitude: -4.2, constellation: 'Virgo', distance: '25.7 million mi', discoverer: 'Ancient'
    },
    {
      id: 6, date: '2024-05-22', object: 'Saturn', type: 'Planet', telescope: 'Hubble',
      visibility: 'Low', eventType: 'conjunction', coordinates: { ra: '21h 45m 12s', dec: '-18° 20\' 45"' },
      magnitude: 0.2, constellation: 'Capricornus', distance: '746 million mi', discoverer: 'Ancient'
    },
    {
      id: 7, date: '2024-04-18', object: 'Whirlpool Galaxy', type: 'Galaxy', telescope: 'James Webb',
      visibility: 'Medium', eventType: 'observation', coordinates: { ra: '13h 25m 27s', dec: '+47° 11\' 43"' },
      magnitude: 8.4, constellation: 'Canes Venatici', distance: '23 million ly', discoverer: 'Charles Messier'
    },
    {
      id: 8, date: '2024-03-25', object: 'Solar Eclipse', type: 'Star', telescope: 'Kepler',
      visibility: 'High', eventType: 'eclipse', coordinates: { ra: '12h 00m 00s', dec: '+00° 00\' 00"' },
      magnitude: -26.7, constellation: 'Pisces', distance: '93 million mi', discoverer: 'Ancient'
    },
    {
      id: 9, date: '2024-02-14', object: 'Ring Nebula', type: 'Nebula', telescope: 'Hubble',
      visibility: 'Low', eventType: 'observation', coordinates: { ra: '18h 53m 35s', dec: '+33° 01\' 45"' },
      magnitude: 8.8, constellation: 'Lyra', distance: '2,300 ly', discoverer: 'Antoine Darquier de Pellepoix'
    },
    {
      id: 10, date: '2024-01-30', object: 'Mars Opposition', type: 'Planet', telescope: 'James Webb',
      visibility: 'Medium', eventType: 'conjunction', coordinates: { ra: '14h 15m 30s', dec: '-12° 45\' 20"' },
      magnitude: -1.8, constellation: 'Libra', distance: '35 million mi', discoverer: 'Ancient'
    }
  ];

  // Generate additional data for better testing
  const additionalObjects = [
    'Horsehead Nebula', 'Eagle Nebula', 'Cat\'s Eye Nebula', 'Rosette Nebula', 'Helix Nebula',
    'Pinwheel Galaxy', 'Sombrero Galaxy', 'Triangulum Galaxy', 'Centaurus A', 'NGC 1300',
    'Betelgeuse', 'Rigel', 'Vega', 'Altair', 'Deneb', 'Sirius', 'Canopus', 'Arcturus',
    'Mercury Transit', 'Mars Conjunction', 'Jupiter Opposition', 'Saturn Rings', 'Uranus',
    'Pleiades Cluster', 'Hyades Cluster', 'Double Cluster', 'Globular Cluster M13'
  ];

  const types = ['Galaxy', 'Nebula', 'Star', 'Planet', 'Cluster'];
  const telescopes = ['Hubble', 'James Webb', 'Kepler', 'Spitzer', 'Chandra'];
  const visibilities = ['High', 'Medium', 'Low'];
  const eventTypes = ['observation', 'transit', 'conjunction', 'eclipse', 'opposition'];
  const constellations = ['Orion', 'Ursa Major', 'Cassiopeia', 'Andromeda', 'Cygnus', 'Leo', 'Virgo', 'Gemini'];

  const enhancedData = [...baseData];

  // Generate additional entries
  for (let i = 11; i <= 50; i++) {
    const randomObject = additionalObjects[Math.floor(Math.random() * additionalObjects.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomTelescope = telescopes[Math.floor(Math.random() * telescopes.length)];
    const randomVisibility = visibilities[Math.floor(Math.random() * visibilities.length)];
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomConstellation = constellations[Math.floor(Math.random() * constellations.length)];

    const randomDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    
    enhancedData.push({
      id: i,
      date: randomDate.toISOString().split('T')[0],
      object: randomObject,
      type: randomType,
      telescope: randomTelescope,
      visibility: randomVisibility,
      eventType: randomEventType,
      coordinates: {
        ra: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}h ${String(Math.floor(Math.random() * 60)).padStart(2, '0')}m ${String(Math.floor(Math.random() * 60)).padStart(2, '0')}s`,
        dec: `${Math.random() > 0.5 ? '+' : '-'}${String(Math.floor(Math.random() * 90)).padStart(2, '0')}° ${String(Math.floor(Math.random() * 60)).padStart(2, '0')}' ${String(Math.floor(Math.random() * 60)).padStart(2, '0')}"`
      },
      magnitude: (Math.random() * 20 - 10).toFixed(1),
      constellation: randomConstellation,
      distance: `${(Math.random() * 1000).toFixed(1)} ${Math.random() > 0.5 ? 'ly' : 'million mi'}`,
      discoverer: ['Charles Messier', 'William Herschel', 'Caroline Herschel', 'Edwin Hubble', 'Ancient'][Math.floor(Math.random() * 5)]
    });
  }

  return enhancedData;
};

const SearchPage = () => {
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useLocalStorage('search-view-mode', 'list');
  const [sortBy, setSortBy] = useLocalStorage('search-sort-by', 'Date (Newest)');
  const [showCount, setShowCount] = useLocalStorage('search-show-count', 10);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [startDate, setStartDate] = useState(new Date('01/01/2025'));
  const [endDate, setEndDate] = useState(new Date('12/31/2025'));
  const [telescopeSource, setTelescopeSource] = useLocalStorage('search-telescope', '');
  const [celestialType, setCelestialType] = useLocalStorage('search-celestial-type', '');
  const [eventType, setEventType] = useLocalStorage('search-event-type', '');
  const [visibility, setVisibility] = useLocalStorage('search-visibility', '');
  const [quickSelect, setQuickSelect] = useState('');

  // New enhanced state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchStats, setSearchStats] = useLocalStorage('search-stats', { totalSearches: 0, popularTerms: {} });

  // Refs
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Custom hooks
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { searchHistory, addToHistory, clearHistory } = useSearchHistory();

  // Enhanced export options
  const [exportOptions, setExportOptions] = useState({
    basicInfo: true,
    celestialCoordinates: true,
    visibilityData: true,
    telescopeSource: true,
    scientificMeasurements: false,
    researchNotes: false,
    discoveryInfo: false,
    constellationData: false
  });

  // Enhanced celestial data
  const celestialData = useMemo(() => generateEnhancedCelestialData(), []);

  // Generate search suggestions
  const generateSuggestions = useCallback((query) => {
    if (!query.trim()) return [];
    
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Object name suggestions
    const objectSuggestions = celestialData
      .filter(item => item.object.toLowerCase().includes(queryLower))
      .slice(0, 3)
      .map(item => ({ type: 'object', value: item.object, icon: '🌟' }));
    
    // Type suggestions
    const typeSuggestions = [...new Set(celestialData.map(item => item.type))]
      .filter(type => type.toLowerCase().includes(queryLower))
      .slice(0, 2)
      .map(type => ({ type: 'type', value: type, icon: '🔭' }));
    
    // Constellation suggestions
    const constellationSuggestions = [...new Set(celestialData.map(item => item.constellation))]
      .filter(constellation => constellation.toLowerCase().includes(queryLower))
      .slice(0, 2)
      .map(constellation => ({ type: 'constellation', value: constellation, icon: '⭐' }));

    suggestions.push(...objectSuggestions, ...typeSuggestions, ...constellationSuggestions);
    
    return suggestions.slice(0, 5);
  }, [celestialData]);

  // Update suggestions when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      const suggestions = generateSuggestions(debouncedSearchTerm);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearchTerm, generateSuggestions]);

  // Enhanced filtering logic
  const filteredData = useMemo(() => {
    setIsLoading(true);
    
    const filtered = celestialData.filter(item => {
      const itemDate = new Date(item.date);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // Enhanced search - multiple fields
      const searchQuery = debouncedSearchTerm.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.object.toLowerCase().includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery) ||
        item.telescope.toLowerCase().includes(searchQuery) ||
        item.constellation.toLowerCase().includes(searchQuery) ||
        item.discoverer.toLowerCase().includes(searchQuery) ||
        item.eventType.toLowerCase().includes(searchQuery);
      
      const matchesDateRange = itemDate >= startDateObj && itemDate <= endDateObj;
      
      const matchesTelescope = !telescopeSource || telescopeSource === 'all' || 
                              item.telescope.toLowerCase() === telescopeSource.toLowerCase();
      
      const matchesCelestialType = !celestialType || celestialType === 'all' || 
                                  item.type.toLowerCase() === celestialType.toLowerCase();
      
      const matchesEventType = !eventType || eventType === 'all' || 
                              item.eventType.toLowerCase() === eventType.toLowerCase();
      
      const matchesVisibility = !visibility || visibility === 'all' || 
                               item.visibility.toLowerCase() === visibility.toLowerCase();

      return matchesSearch && matchesDateRange && matchesTelescope && 
             matchesCelestialType && matchesEventType && matchesVisibility;
    });

    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 200);
    
    return filtered;
  }, [debouncedSearchTerm, startDate, endDate, telescopeSource, celestialType, eventType, visibility, celestialData]);

  // Enhanced sorting logic
  const sortedData = useMemo(() => {
    const data = [...filteredData];
    
    switch (sortBy) {
      case 'Date (Newest)':
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'Date (Oldest)':
        return data.sort((a, b) => new Date(a.date) - new Date(b.date));
      case 'Name A-Z':
        return data.sort((a, b) => a.object.localeCompare(b.object));
      case 'Name Z-A':
        return data.sort((a, b) => b.object.localeCompare(a.object));
      case 'Magnitude':
        return data.sort((a, b) => parseFloat(a.magnitude) - parseFloat(b.magnitude));
      case 'Visibility':
        const visibilityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return data.sort((a, b) => visibilityOrder[b.visibility] - visibilityOrder[a.visibility]);
      default:
        return data;
    }
  }, [filteredData, sortBy]);

  // Pagination logic
  const itemsPerPage = showCount;
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, startDate, endDate, telescopeSource, celestialType, eventType, visibility, sortBy]);

  // Enhanced search handling
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      // Update search stats
      setSearchStats(prev => ({
        totalSearches: prev.totalSearches + 1,
        popularTerms: {
          ...prev.popularTerms,
          [value.toLowerCase()]: (prev.popularTerms[value.toLowerCase()] || 0) + 1
        }
      }));
    }
  }, [setSearchStats]);

  const handleSearchSubmit = useCallback(() => {
    if (searchTerm.trim()) {
      addToHistory(searchTerm);
      setShowSearchHistory(false);
      setShowSuggestions(false);
    }
  }, [searchTerm, addToHistory]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setSearchTerm(suggestion.value);
    addToHistory(suggestion.value);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  }, [addToHistory]);

  const handleHistoryClick = useCallback((historyItem) => {
    setSearchTerm(historyItem.term);
    setShowSearchHistory(false);
    searchInputRef.current?.focus();
  }, []);

  // Enhanced quick select with more options
  const handleQuickSelect = (option) => {
    setQuickSelect(option);
    const today = new Date();
    
    switch (option) {
      case 'Last 30 Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setStartDate(thirtyDaysAgo);
        setEndDate(today);
        break;
      case 'Last 90 Days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        setStartDate(ninetyDaysAgo);
        setEndDate(today);
        break;
      case 'This Year':
        setStartDate(new Date(`${today.getFullYear()}-01-01`));
        setEndDate(new Date(`${today.getFullYear()}-12-31`));
        break;
      case 'All Time':
        setStartDate(new Date('2020-01-01'));
        setEndDate(new Date('2030-12-31'));
        break;
    }
  };

  // Enhanced selection handling
  const handleSelectAll = () => {
    if (selectedItems.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedData.map(item => item.id)));
    }
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };


  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case 'High': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Enhanced reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStartDate(new Date('01/01/2025'));
    setEndDate(new Date('12/31/2025'));
    setTelescopeSource('');
    setCelestialType('');
    setEventType('');
    setVisibility('');
    setQuickSelect('');
    setCurrentPage(1);
    setSelectedItems(new Set());
    setError(null);
  };

  // Enhanced export functionality
  const handleExport = (format) => {
    try {
      setIsLoading(true);
      
      const selectedData = selectedItems.size > 0 
        ? sortedData.filter(item => selectedItems.has(item.id))
        : paginatedData;
      
      const exportData = selectedData.map(item => {
        const data = {};
        
        if (exportOptions.basicInfo) {
          data.date = item.date;
          data.object = item.object;
          data.type = item.type;
        }
        
        if (exportOptions.celestialCoordinates) {
          data.rightAscension = item.coordinates.ra;
          data.declination = item.coordinates.dec;
        }
        
        if (exportOptions.visibilityData) {
          data.visibility = item.visibility;
          data.magnitude = item.magnitude;
        }
        
        if (exportOptions.telescopeSource) {
          data.telescope = item.telescope;
          data.eventType = item.eventType;
        }
        
        if (exportOptions.scientificMeasurements) {
          data.magnitude = item.magnitude;
          data.distance = item.distance;
        }
        
        if (exportOptions.researchNotes) {
          data.notes = `Observation of ${item.object} conducted via ${item.telescope}`;
        }

        if (exportOptions.discoveryInfo) {
          data.discoverer = item.discoverer;
        }

        if (exportOptions.constellationData) {
          data.constellation = item.constellation;
        }
        
        return data;
      });

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `celestial_search_results_${timestamp}`;

      if (format === 'csv') {
        if (exportData.length === 0) {
          throw new Error('No data to export');
        }
        
        const headers = Object.keys(exportData[0]).join(',');
        const csvContent = exportData.map(row => 
          Object.values(row).map(val => `"${val}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'json') {
        const exportMetadata = {
          exportDate: new Date().toISOString(),
          totalResults: sortedData.length,
          exportedResults: exportData.length,
          searchTerm: searchTerm,
          filters: {
            dateRange: { start: startDate, end: endDate },
            telescopeSource,
            celestialType,
            eventType,
            visibility
          },
          sortBy,
          data: exportData
        };
        
        const blob = new Blob([JSON.stringify(exportMetadata, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      setIsLoading(false);
    } catch (error) {
      setError(`Export failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleViewItem = (item) => {
    const details = `
🌟 ${item.object}

📊 Basic Information:
• Type: ${item.type}
• Constellation: ${item.constellation}
• Date Observed: ${item.date}
• Telescope: ${item.telescope}
• Event Type: ${item.eventType}

🔭 Observational Data:
• Visibility: ${item.visibility}
• Magnitude: ${item.magnitude}
• Distance: ${item.distance}

📍 Coordinates:
• Right Ascension: ${item.coordinates.ra}
• Declination: ${item.coordinates.dec}

🏛️ Discovery:
• Discoverer: ${item.discoverer}

    `;
    
    alert(details);
  };

  // Enhanced download item
  const handleDownloadItem = (item) => {
    try {
      const enhancedItemData = {
        ...item,
        coordinates: item.coordinates,
        exported_at: new Date().toISOString(),
        export_source: 'Astronomy Search Portal'
      };
      
      const blob = new Blob([JSON.stringify(enhancedItemData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.object.replace(/\s+/g, '_')}_${item.date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Download failed: ${error.message}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      switch (e.key) {
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'Escape':
          setShowSuggestions(false);
          setShowSearchHistory(false);
          if (searchTerm) {
            setSearchTerm('');
          }
          break;
        case 'Enter':
          if (showSuggestions && searchSuggestions.length > 0) {
            handleSuggestionClick(searchSuggestions[0]);
          } else if (searchTerm) {
            handleSearchSubmit();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, showSuggestions, searchSuggestions, handleSuggestionClick, handleSearchSubmit]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowSearchHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Search */}
            <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4">
              <div className="relative" ref={suggestionsRef}>
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Celestial Objects, Events ... (Press / to focus)"
                  className="w-full pl-10 pr-10 py-2 bg-[#312E81] border border-[#4338CA] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchHistory.length > 0 && !searchTerm) {
                      setShowSearchHistory(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
                  }}
                />
                
                {/* Clear search button */}
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setShowSuggestions(false);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Search History button */}
                {searchHistory.length > 0 && !searchTerm && (
                  <button
                    onClick={() => setShowSearchHistory(!showSearchHistory)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <History className="h-4 w-4" />
                  </button>
                )}

                {/* Search Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#312E81] border border-[#4338CA] rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-900/50 transition-colors flex items-center space-x-2"
                      >
                        <span>{suggestion.icon}</span>
                        <span className="text-white">{suggestion.value}</span>
                        <span className="text-xs text-gray-400 ml-auto">{suggestion.type}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search History */}
                {showSearchHistory && searchHistory.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#312E81] border border-[#4338CA] rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-gray-600 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">Recent Searches</span>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-900/50 transition-colors flex items-center space-x-2"
                      >
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-white">{item.term}</span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Stats */}
              {searchStats.totalSearches > 0 && (
                <div className="mt-3 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-3 w-3" />
                    <span>{searchStats.totalSearches} total searches</span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Data Export Tools */}
            <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Data Export Tools</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-300 text-left">Select Data Types to Export:</p>
                
                {Object.entries(exportOptions).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleExport('csv')} 
                    disabled={isLoading}
                    className="flex items-center space-x-1 px-3 py-2 border border-white/60 rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Export CSV</span>
                  </button>
                  <button 
                    onClick={() => handleExport('json')}
                    disabled={isLoading}
                    className="flex items-center space-x-1 px-3 py-2 border border-white/60 rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export JSON</span>
                  </button>
                </div>

                {/* Export Status */}
                {selectedItems.size > 0 && (
                  <div className="mt-2 text-xs text-blue-400">
                    {selectedItems.size} items selected for export
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
              
              {/* Date Range */}
              <div className="mb-4 text-left">
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="space-y-2 flex gap-2 text-left">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <DatePicker
                      showIcon
                      icon={<Calendar className="h-4 w-4" />}
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      className="w-full px-3 py-3 border border-gray-600 rounded-md text-white text-sm focus:outline-none cursor-pointer"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <DatePicker
                      showIcon
                      icon={<Calendar className="h-4 w-4" />}
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md text-white text-sm focus:outline-none cursor-pointer"
                      dateFormat="MM/dd/yyyy"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Select */}
              <div className="mb-10 text-left">
                <label className="block text-sm font-medium mb-2">Quick Select</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Last 30 Days', 'Last 90 Days', 'This Year', 'All Time'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleQuickSelect(option)}
                      className={`px-3 py-2 text-xs rounded-md transition-colors ${
                        quickSelect === option 
                          ? 'bg-blue-900/90 text-white' 
                          : ' border border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="space-y-3">
                <div>
                  <select
                    value={telescopeSource}
                    onChange={(e) => setTelescopeSource(e.target.value)}
                    className="w-full px-3 py-2 bg-[#312E81]/54 border border-white/30 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className='bg-blue-900/90'>Telescope source</option>                    
                    <option value="all" className='bg-blue-900/90'>All Telescopes</option>
                    <option value="hubble" className='bg-blue-900/90'>Hubble</option>
                    <option value="james-webb" className='bg-blue-900/90'>James Webb</option>
                    <option value="kepler" className='bg-blue-900/90'>Kepler</option>
                    <option value="spitzer" className='bg-blue-900/90'>Spitzer</option>
                    <option value="chandra" className='bg-blue-900/90'>Chandra</option>
                  </select>
                </div>

                <div>
                  <select
                    value={celestialType}
                    onChange={(e) => setCelestialType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#312E81]/54 border border-white/30 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className='bg-blue-900/90'>Celestial type</option>                                        
                    <option value="all" className='bg-blue-900/90'>All Types</option>
                    <option value="galaxy" className='bg-blue-900/90'>Galaxy</option>
                    <option value="nebula" className='bg-blue-900/90'>Nebula</option>
                    <option value="star" className='bg-blue-900/90'>Star</option>
                    <option value="planet" className='bg-blue-900/90'>Planet</option>
                    <option value="cluster" className='bg-blue-900/90'>Cluster</option>
                  </select>
                </div>

                <div>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#312E81]/54 border border-white/30 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className='bg-blue-900/90'>Event type</option>
                    <option value="all" className='bg-blue-900/90'>All Events</option>
                    <option value="eclipse" className='bg-blue-900/90'>Eclipse</option>
                    <option value="transit" className='bg-blue-900/90'>Transit</option>
                    <option value="conjunction" className='bg-blue-900/90'>Conjunction</option>
                    <option value="observation" className='bg-blue-900/90'>Observation</option>
                    <option value="opposition" className='bg-blue-900/90'>Opposition</option>
                  </select>
                </div>

                <div>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-3 py-2 bg-[#312E81]/54 border border-white/30 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" className='bg-blue-900/90'>Visibility</option>
                    <option value="all" className='bg-blue-900/90'>All Visibility</option>
                    <option value="high" className='bg-blue-900/90'>High</option>
                    <option value="medium" className='bg-blue-900/90'>Medium</option>
                    <option value="low" className='bg-blue-900/90'>Low</option>
                  </select>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full mt-4 px-4 py-2 border border-white/30 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Error Display */}
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

            {/* Search Results Header */}
            <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold">Search Results</h2>
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-0">
                        <span className="text-sm text-gray-400 px-2">View:</span>
                        <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-bl-lg border border-white/30 rounded-tl-lg ${viewMode === 'list' ? 'bg-blue-900/90' : ' hover:bg-gray-600'}`}
                        >
                        <List className="h-4 w-4" />
                        </button>
                        <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-br-lg border border-white/30 rounded-tr-lg ${viewMode === 'grid' ? 'bg-blue-900/90' : ' hover:bg-gray-600'}`}
                        >
                        <Grid className="h-4 w-4" />
                        </button>
                    </div>
                    <span className="text-sm text-gray-400 px-2">Sort By:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1 border border-white/30 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option className='bg-blue-900/90'>Date (Newest)</option>
                      <option className='bg-blue-900/90'>Date (Oldest)</option>
                      <option className='bg-blue-900/90'>Name A-Z</option>
                      <option className='bg-blue-900/90'>Name Z-A</option>
                      <option className='bg-blue-900/90'>Magnitude</option>
                      <option className='bg-blue-900/90'>Visibility</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400 pr-2">Show:</span>
                    <select
                      value={showCount}
                      onChange={(e) => setShowCount(Number(e.target.value))}
                      className="px-3 py-1 border border-white/30 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10} className='bg-blue-900/90'>10</option>
                      <option value={25} className='bg-blue-900/90'>25</option>
                      <option value={50} className='bg-blue-900/90'>50</option>
                      <option value={100} className='bg-blue-900/90'>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Showing {paginatedData.length} of {sortedData.length} Results
                  {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Selected: {selectedItems.size}</span>
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Results Table */}
              {viewMode === 'list' && (
                <div className="bg-[#1E1E3C] border-white/25 border rounded-lg overflow-hidden mt-10">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                              onChange={handleSelectAll}
                              className="rounded w-4 h-4 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date ▲</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Object</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Telescope</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Visibility</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700 text-left">
                        {paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                className="rounded w-4 h-4 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">{item.date}</td>
                            <td className="px-4 py-3 text-sm text-white">{item.object}</td>
                            <td className="px-4 py-3 text-sm text-gray-300">{item.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-300">{item.telescope}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getVisibilityColor(item.visibility)}`}>
                                {item.visibility}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleViewItem(item)}
                                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                  title='View Details'
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDownloadItem(item)}
                                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                  title='Download Item'
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedData.map((item) => (
                      <div key={item.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded w-4 h-4 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getVisibilityColor(item.visibility)}`}>
                              {item.visibility}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{item.object}</h3>
                        <p className="text-sm text-gray-300 mb-2">{item.type} • {item.telescope}</p>
                        <p className="text-xs text-gray-400 mb-1">{item.constellation}</p>
                        <p className="text-xs text-gray-400 mb-3">{item.date}</p>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewItem(item)}
                            className="flex-1 px-3 py-1 border border-white/30 rounded-md text-xs hover:bg-gray-600 transition-colors"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDownloadItem(item)}
                            className="flex-1 px-3 py-1 border border-white/30 rounded-md text-xs hover:bg-gray-600 transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages} • Showing {paginatedData.length} of {sortedData.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1 px-3 py-1 border border-white/30 rounded-md text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
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
                            className={`w-8 h-8 rounded text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'border border-white/30 text-gray-300 hover:bg-gray-600'
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
                      className="flex items-center space-x-1 px-3 py-1 border border-white/30 rounded-md text-sm hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && sortedData.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No results found</h3>
                  <p className="text-gray-400 mb-4">
                    {debouncedSearchTerm 
                      ? `No celestial objects found matching "${debouncedSearchTerm}"`
                      : 'Try adjusting your search terms or filters'
                    }
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

