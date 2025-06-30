import { ChevronDown, Search} from 'lucide-react';


const Filters = ({ filters, onFilterChange, onClearFilters }) => {
  const FilterSelect = ({ value, onChange, options, placeholder, ariaLabel }) => (
    <div className="relative border border-white/20 hover:border-white/40 transition-colors flex items-center px-3 rounded-lg bg-slate-800/50 backdrop-blur-sm">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer pr-8"
        aria-label={ariaLabel}
      >
        <option value="" className="bg-gray-800">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-white/60 pointer-events-none absolute right-3" />
    </div>
  );

  const eventTypeOptions = [
    { value: 'meteor shower', label: 'Meteor Shower' },
    { value: 'eclipse', label: 'Eclipse' },
    { value: 'planetary', label: 'Planetary Event' },
    { value: 'conjunction', label: 'Conjunction' },
    { value: 'moon phase', label: 'Moon Phases' }
  ];

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Next 3 Months' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' },
    { value: 'members', label: 'Members Only' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <FilterSelect
            value={filters.eventType}
            onChange={(value) => onFilterChange('eventType', value)}
            options={eventTypeOptions}
            placeholder="Event Type"
            ariaLabel="Filter by event type"
          />
          
          <FilterSelect
            value={filters.timeRange}
            onChange={(value) => onFilterChange('timeRange', value)}
            options={timeRangeOptions}
            placeholder="Time Range"
            ariaLabel="Filter by time range"
          />
          
          <FilterSelect
            value={filters.visibility}
            onChange={(value) => onFilterChange('visibility', value)}
            options={visibilityOptions}
            placeholder="Visibility"
            ariaLabel="Filter by visibility"
          />

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-colors bg-slate-800/50 backdrop-blur-sm"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="relative w-full lg:w-104">
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            placeholder="Search events..."
            className="bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800/80 focus:bg-slate-800 text-white pl-10 pr-4 py-2 rounded-lg w-full border border-white/20 hover:border-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            aria-label="Search events"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.eventType && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 text-sm rounded border border-blue-600/30 backdrop-blur-sm">
              Type: {eventTypeOptions.find(opt => opt.value === filters.eventType)?.label}
              <button 
                onClick={() => onFilterChange('eventType', '')}
                className="ml-1 hover:text-blue-100"
                aria-label="Remove event type filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.timeRange && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 text-sm rounded border border-green-600/30 backdrop-blur-sm">
              Time: {timeRangeOptions.find(opt => opt.value === filters.timeRange)?.label}
              <button 
                onClick={() => onFilterChange('timeRange', '')}
                className="ml-1 hover:text-green-100"
                aria-label="Remove time range filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.visibility && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-300 text-sm rounded border border-purple-600/30 backdrop-blur-sm">
              Visibility: {visibilityOptions.find(opt => opt.value === filters.visibility)?.label}
              <button 
                onClick={() => onFilterChange('visibility', '')}
                className="ml-1 hover:text-purple-100"
                aria-label="Remove visibility filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-600/20 text-orange-300 text-sm rounded border border-orange-600/30 backdrop-blur-sm">
              Search: "{filters.searchTerm}"
              <button 
                onClick={() => onFilterChange('searchTerm', '')}
                className="ml-1 hover:text-orange-100"
                aria-label="Remove search filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters;