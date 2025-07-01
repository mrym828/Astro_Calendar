import React, { useState, useMemo } from 'react';
import { Search, Download, FileText, Grid, List, ChevronDown, Eye, Calendar, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SearchPage =()=>{
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('Date (Newest)');
  const [showCount, setShowCount] = useState(10);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [startDate, setStartDate] = useState(new Date('01/01/2025'));
  const [endDate, setEndDate] = useState(new Date('12/31/2025'));
  const [telescopeSource, setTelescopeSource] = useState('');
  const [celestialType, setCelestialType] = useState('');
  const [eventType, setEventType] = useState('');
  const [visibility, setVisibility] = useState('');
  const [quickSelect, setQuickSelect] = useState('');

  // Sample data
  const celestialData = [
    {
      id: 1,
      date: '2025-01-25',
      object: 'Andromeda Galaxy',
      type: 'Galaxy',
      telescope: 'Hubble',
      visibility: 'High',
      eventType: 'observation',
      coordinates: { ra: '00h 42m 44s', dec: '+41° 16\' 09"' },
      magnitude: 3.4
    },
    {
      id: 2,
      date: '2024-09-16',
      object: 'Crab Nebula',
      type: 'Nebula',
      telescope: 'James Webb',
      visibility: 'Medium',
      eventType: 'observation',
      coordinates: { ra: '05h 34m 31s', dec: '+22° 00\' 52"' },
      magnitude: 8.4
    },
    {
      id: 3,
      date: '2024-08-12',
      object: 'Jupiter',
      type: 'Planet',
      telescope: 'Kepler',
      visibility: 'Low',
      eventType: 'transit',
      coordinates: { ra: '23h 15m 20s', dec: '-05° 30\' 15"' },
      magnitude: -2.1
    },
    {
      id: 4,
      date: '2024-07-08',
      object: 'Orion Nebula',
      type: 'Nebula',
      telescope: 'Hubble',
      visibility: 'Medium',
      eventType: 'observation',
      coordinates: { ra: '05h 35m 12s', dec: '-05° 23\' 14"' },
      magnitude: 4.0
    },
    {
      id: 5,
      date: '2024-06-15',
      object: 'Venus Transit',
      type: 'Planet',
      telescope: 'James Webb',
      visibility: 'High',
      eventType: 'transit',
      coordinates: { ra: '12h 30m 45s', dec: '+15° 45\' 30"' },
      magnitude: -4.2
    },
    {
      id: 6,
      date: '2024-05-22',
      object: 'Saturn',
      type: 'Planet',
      telescope: 'Hubble',
      visibility: 'Low',
      eventType: 'conjunction',
      coordinates: { ra: '21h 45m 12s', dec: '-18° 20\' 45"' },
      magnitude: 0.2
    },
    {
      id: 7,
      date: '2024-04-18',
      object: 'Whirlpool Galaxy',
      type: 'Galaxy',
      telescope: 'James Webb',
      visibility: 'Medium',
      eventType: 'observation',
      coordinates: { ra: '13h 25m 27s', dec: '+47° 11\' 43"' },
      magnitude: 8.4
    },
    {
      id: 8,
      date: '2024-03-25',
      object: 'Solar Eclipse',
      type: 'Star',
      telescope: 'Kepler',
      visibility: 'High',
      eventType: 'eclipse',
      coordinates: { ra: '12h 00m 00s', dec: '+00° 00\' 00"' },
      magnitude: -26.7
    },
    {
      id: 9,
      date: '2024-02-14',
      object: 'Ring Nebula',
      type: 'Nebula',
      telescope: 'Hubble',
      visibility: 'Low',
      eventType: 'observation',
      coordinates: { ra: '18h 53m 35s', dec: '+33° 01\' 45"' },
      magnitude: 8.8
    },
    {
      id: 10,
      date: '2024-01-30',
      object: 'Mars Opposition',
      type: 'Planet',
      telescope: 'James Webb',
      visibility: 'Medium',
      eventType: 'conjunction',
      coordinates: { ra: '14h 15m 30s', dec: '-12° 45\' 20"' },
      magnitude: -1.8
    }
  ];

  const [exportOptions, setExportOptions] = useState({
    basicInfo: true,
    celestialCoordinates: true,
    visibilityData: true,
    telescopeSource: true,
    scientificMeasurements: false,
    researchNotes: false
  });

  const filteredData = useMemo(() => {
    return celestialData.filter(item => {
      const itemDate = new Date(item.date);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const matchesSearch = item.object.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.type.toLowerCase().includes(searchTerm.toLowerCase());
      
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
  }, [searchTerm, startDate, endDate, telescopeSource, celestialType, eventType, visibility]);

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
      default:
        return data;
    }
  }, [filteredData, sortBy]);

  const handleQuickSelect = (option) => {
    setQuickSelect(option);
    const today = new Date();
    
    switch (option) {
      case 'Last 30 Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'Last 90 Days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);
        setStartDate(ninetyDaysAgo.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'This Year':
        setStartDate(`${today.getFullYear()}-01-01`);
        setEndDate(`${today.getFullYear()}-12-31`);
        break;
      case 'All Time':
        setStartDate('2020-01-01');
        setEndDate('2030-12-31');
        break;
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
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

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('01/01/2025');
    setEndDate('12/31/2025');
    setTelescopeSource('');
    setCelestialType('');
    setEventType('');
    setVisibility('');
    setQuickSelect('');
  };

  const handleExport = (format) => {
    const selectedData = sortedData.filter(item => selectedItems.has(item.id));
    const dataToExport = selectedData.length > 0 ? selectedData : sortedData.slice(0, showCount);
    
    const exportData = dataToExport.map(item => {
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
        data.spectralClass = 'G2V'; // Sample data
      }
      
      if (exportOptions.researchNotes) {
        data.notes = `Observation of ${item.object} conducted via ${item.telescope}`;
      }
      
      return data;
    });

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {}).join(',');
      const csvContent = exportData.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      ).join('\n');
      
      const blob = new Blob([headers + '\n' + csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celestial_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `celestial_data_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
  };

  // View individual item
  const handleViewItem = (item) => {
    alert(`Viewing ${item.object}\n\nDetails:\nType: ${item.type}\nTelescope: ${item.telescope}\nDate: ${item.date}\nVisibility: ${item.visibility}\nCoordinates: ${item.coordinates.ra}, ${item.coordinates.dec}\nMagnitude: ${item.magnitude}`);
  };

  // Download individual item
  const handleDownloadItem = (item) => {
    const itemData = {
      ...item,
      coordinates: item.coordinates,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(itemData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.object.replace(/\s+/g, '_')}_${item.date}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Celestial Objects, Events ..."
                  className="w-full pl-10 pr-4 py-2 bg-[#312E81] border border-[#4338CA] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Data Export Tools */}
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
                  className="flex items-center space-x-1 px-3 py-2 border border-white/60 rounded-md hover:bg-white/20 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Export CSV</span>
                  </button>
                  <button 
                  onClick={() => handleExport('json')}
                  className="flex items-center space-x-1 px-3 py-2 border border-white/60 rounded-md hover:bg-white/20 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export JSON</span>
                  </button>
                </div>
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
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>}
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
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>}
                        toggleCalendarOnIconClick
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
            {/* Search Results Header */}
            <div className="bg-[#1E1E3C] border-white/25 border rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold">Search Results</h2>
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
                  Showing {Math.min(sortedData.length, showCount)} of {sortedData.length} Results
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
                          checked={selectedItems.size === Math.min(sortedData.length, showCount) && sortedData.length > 0}
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
                    {sortedData.slice(0, showCount).map((item) => (
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
                            title='Download Item'>
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
                  {sortedData.slice(0, showCount).map((item) => (
                    <div key={item.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded w-4 h-4 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getVisibilityColor(item.visibility)}`}>
                          {item.visibility}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.object}</h3>
                      <p className="text-sm text-gray-300 mb-2">{item.type} • {item.telescope}</p>
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
                
                {/* Grid Pagination */}
                {sortedData.length > showCount && (
                  <div className="mt-4 flex justify-center">
                    <button 
                      className="px-4 py-2 border border-white/30 rounded-md hover:bg-gray-600 transition-colors"
                      onClick={() => setShowCount(prev => Math.min(prev + 12, sortedData.length))}
                      disabled={showCount >= sortedData.length}
                    >
                      Load More Items
                    </button>
                  </div>
                )}
              </div>
            )}


                {/* Pagination */}
              {sortedData.length > showCount && (
                <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {Math.min(showCount, sortedData.length)} of {sortedData.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="px-3 py-1 border border-white/30 rounded-md text-sm hover:bg-gray-600 transition-colors"
                      onClick={() => setShowCount(prev => Math.min(prev + 10, sortedData.length))}
                      disabled={showCount >= sortedData.length}
                    >
                      Load More
                    </button>
                  </div>
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