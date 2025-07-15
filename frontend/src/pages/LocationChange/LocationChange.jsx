import React, { useState, useEffect } from 'react';
import { MapPin, Search, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button/Button';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Enhanced API service with multiple providers and fallback mechanisms
class LocationAPIService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  // Retry mechanism for API calls
  async withRetry(apiCall, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  // Enhanced geocoding with multiple providers
  async geocodeLocation(locationName) {
    const providers = [
      () => this.geocodeWithNominatim(locationName),
      () => this.geocodeWithGoogle(locationName),
    ];

    for (const provider of providers) {
      try {
        const result = await this.withRetry(provider);
        if (result) return result;
      } catch (error) {
        console.warn('Geocoding provider failed:', error);
      }
    }
    
    throw new Error('All geocoding providers failed');
  }

  // Nominatim (OpenStreetMap) geocoding
  async geocodeWithNominatim(locationName) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1&addressdetails=1&extratags=1`,
      {
        headers: {
          'User-Agent': 'LocationApp/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Nominatim API error');
    
    const data = await response.json();
    if (data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formattedAddress: result.display_name,
        country_code: result.address?.country_code?.toUpperCase() || '',
        provider: 'nominatim'
      };
    }
    return null;
  }

  // Google Maps geocoding (fallback)
  async geocodeWithGoogle(locationName) {
    if (!GOOGLE_MAPS_API_KEY) return null;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Google Maps API error');
    
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract country code from address components
      const countryComponent = result.address_components?.find(
        component => component.types.includes('country')
      );
      
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        country_code: countryComponent?.short_name || '',
        provider: 'google'
      };
    }
    return null;
  }

  // Enhanced reverse geocoding with multiple providers
  async reverseGeocode(lat, lng) {
    const providers = [
      () => this.reverseGeocodeWithNominatim(lat, lng),
      () => this.reverseGeocodeWithGoogle(lat, lng),
    ];

    for (const provider of providers) {
      try {
        const result = await this.withRetry(provider);
        if (result) return result;
      } catch (error) {
        console.warn('Reverse geocoding provider failed:', error);
      }
    }
    
    return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  // Nominatim reverse geocoding
  async reverseGeocodeWithNominatim(lat, lng) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'LocationApp/1.0'
        }
      }
    );
    
    if (!response.ok) throw new Error('Nominatim reverse geocoding error');
    
    const data = await response.json();
    return data.display_name || null;
  }

  // Google reverse geocoding (fallback)
  async reverseGeocodeWithGoogle(lat, lng) {
    if (!GOOGLE_MAPS_API_KEY) return null;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Google reverse geocoding error');
    
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return null;
  }

  // Enhanced timezone detection with multiple providers
  async getTimezone(lat, lng) {
    const providers = [
      () => this.getTimezoneFromWorldTimeAPI(lat, lng),
      () => this.getTimezoneFromGoogle(lat, lng),
      () => this.getTimezoneFromIP(),
    ];

    for (const provider of providers) {
      try {
        const result = await this.withRetry(provider);
        if (result) return result;
      } catch (error) {
        console.warn('Timezone provider failed:', error);
      }
    }
    
    // Fallback to browser timezone
    return this.getBrowserTimezone();
  }

  // WorldTimeAPI timezone detection
  async getTimezoneFromWorldTimeAPI(lat, lng) {
    // WorldTimeAPI doesn't support coordinates directly, so we'll use IP-based detection
    const response = await fetch('https://worldtimeapi.org/api/ip');
    if (!response.ok) throw new Error('WorldTimeAPI error');
    
    const data = await response.json();
    return {
      timezone: data.timezone,
      offset: data.utc_offset,
      abbreviation: data.abbreviation
    };
  }

  // Google timezone (fallback)
  async getTimezoneFromGoogle(lat, lng) {
    if (!GOOGLE_MAPS_API_KEY) return null;
    
    const timestamp = Math.floor(Date.now() / 1000);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) throw new Error('Google timezone error');
    
    const data = await response.json();
    if (data.status === 'OK') {
      return {
        timezone: data.timeZoneName,
        offset: `GMT${data.rawOffset >= 0 ? '+' : ''}${data.rawOffset / 3600}`,
        abbreviation: data.timeZoneId
      };
    }
    return null;
  }

  // IP-based timezone detection
  async getTimezoneFromIP() {
    const response = await fetch('https://ip-api.com/json/?fields=timezone,offset');
    if (!response.ok) throw new Error('IP-API error');
    
    const data = await response.json();
    return {
      timezone: data.timezone,
      offset: `GMT${data.offset >= 0 ? '+' : ''}${data.offset / 3600}`,
      abbreviation: data.timezone
    };
  }

  // Browser timezone fallback
  getBrowserTimezone() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(offset) / 60;
    const offsetSign = offset <= 0 ? '+' : '-';
    
    return {
      timezone: timezone,
      offset: `GMT${offsetSign}${offsetHours}`,
      abbreviation: timezone
    };
  }

  // IP-based location detection
  async detectLocationFromIP() {
    try {
      const response = await fetch('https://ip-api.com/json/?fields=lat,lon,city,regionName,country,timezone');
      if (!response.ok) throw new Error('IP location detection failed');
      
      const data = await response.json();
      return {
        lat: data.lat,
        lng: data.lon,
        name: `${data.city}, ${data.regionName}, ${data.country}`,
        timezone: data.timezone
      };
    } catch (error) {
      console.warn('IP location detection failed:', error);
      return null;
    }
  }
}

// Enhanced backend communication service
class BackendService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || '';
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async withRetry(apiCall, attempts = this.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  // Convert GMT offset to proper timezone name
  convertGMTToTimezone(gmtOffset) {
    const timezoneMap = {
      'GMT-12': 'Pacific/Kwajalein',
      'GMT-11': 'Pacific/Midway',
      'GMT-10': 'Pacific/Honolulu',
      'GMT-9': 'America/Anchorage',
      'GMT-8': 'America/Los_Angeles',
      'GMT-7': 'America/Denver',
      'GMT-6': 'America/Chicago',
      'GMT-5': 'America/New_York',
      'GMT-4': 'America/Halifax',
      'GMT-3': 'America/Sao_Paulo',
      'GMT-2': 'Atlantic/South_Georgia',
      'GMT-1': 'Atlantic/Azores',
      'GMT+0': 'UTC',
      'GMT+1': 'Europe/London',
      'GMT+2': 'Europe/Berlin',
      'GMT+3': 'Europe/Moscow',
      'GMT+4': 'Asia/Dubai',
      'GMT+5': 'Asia/Karachi',
      'GMT+5:30': 'Asia/Kolkata',
      'GMT+6': 'Asia/Dhaka',
      'GMT+7': 'Asia/Bangkok',
      'GMT+8': 'Asia/Shanghai',
      'GMT+9': 'Asia/Tokyo',
      'GMT+10': 'Australia/Sydney',
      'GMT+11': 'Pacific/Noumea',
      'GMT+12': 'Pacific/Auckland'
    };
    
    return timezoneMap[gmtOffset] || 'UTC';
  }

  // Validate and format country code
  formatCountryCode(countryCode) {
    if (!countryCode || typeof countryCode !== 'string') {
      return '';
    }
    
    const formatted = countryCode.trim().toUpperCase();
    
    // Ensure it's 2 or 3 characters
    if (formatted.length === 2 || formatted.length === 3) {
      return formatted;
    }
    
    return '';
  }
  // Enhanced location submission with validation and retry logic
  async submitLocation(locationData) {
    // Validate location data
    const validationErrors = this.validateLocationData(locationData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Extract latitude and longitude from coordinates string
    const coordMatch = locationData.coordinates.match(/Lat (-?\d+\.?\d*), Lon (-?\d+\.?\d*)/);
    if (!coordMatch) {
      throw new Error('Invalid coordinate format');
    }
    
    const latitude = parseFloat(coordMatch[1]);
    const longitude = parseFloat(coordMatch[2]);

    // Convert timezone and format country code properly
    const properTimezone = this.convertGMTToTimezone(locationData.timezone || 'GMT+0');
    const formattedCountryCode = this.formatCountryCode(locationData.country_code);

    // Create payload that matches Django Location model
    const modelPayload = {
      name: locationData.name,
      latitude: latitude,
      longitude: longitude,
      timezone: properTimezone,
      country_code: formattedCountryCode,
      elevation_meters: parseInt(locationData.elevation_meters) || 0,
      light_pollution_level: parseInt(locationData.light_pollution_level) || 5
    };

    const submitCall = async () => {
      console.log('🚀 Sending location data:', modelPayload);
      
      const response = await fetch(`${this.baseURL}/set-location/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(modelPayload),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log('❌ Error response data:', errorData);
        } catch (e) {
          console.log('❌ Could not parse error response as JSON');
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Success response:', result);
      return result;
    };

    return await this.withRetry(submitCall);
  }

  // Validate location data before submission
  validateLocationData(data) {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Location name is required');
    }
    
    if (!data.coordinates || typeof data.coordinates !== 'string') {
      errors.push('Coordinates are required');
    }
    
    if (!data.timezone || typeof data.timezone !== 'string') {
      errors.push('Timezone is required');
    }
    
    // Validate coordinate format
    const coordMatch = data.coordinates?.match(/Lat (-?\d+\.?\d*), Lon (-?\d+\.?\d*)/);
    if (!coordMatch) {
      errors.push('Invalid coordinate format');
    } else {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      
      if (lat < -90 || lat > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
      
      if (lng < -180 || lng > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
    
    return errors;
  }

  // Health check endpoint
  async checkHealth() {
    try {
      console.log('🔍 Checking backend health...');
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      console.log('🔍 Health check response:', response.status);
      return response.ok;
    } catch (error) {
      console.log('🔍 Health check failed:', error.message);
      return false;
    }
  }

  // Test endpoint connectivity
  async testEndpoint() {
    try {
      console.log('🧪 Testing /set-location/ endpoint...');
      const response = await fetch(`${this.baseURL}/set-location/`, {
        method: 'OPTIONS',
        headers: { 'Accept': 'application/json' }
      });
      console.log('🧪 OPTIONS response:', response.status);
      console.log('🧪 CORS headers:', {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      });
      return response.ok;
    } catch (error) {
      console.log('🧪 Endpoint test failed:', error.message);
      return false;
    }
  }
}

const LocationChange = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'Custom Location, Map Selection',
    coordinates: 'Lat 25.33, Lon 55.52',
    timezone: 'GMT+4',
    localTime: '3:05 PM',
    country_code: '',
    elevation_meters: 0,
    light_pollution_level: 5
  });
  
  const [detectedLocation, setDetectedLocation] = useState({
    name: 'Detecting location...',
    isDetected: false
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [showMap, setShowMap] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 25.33, lng: 55.52 });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('GMT+4');
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [backendHealth, setBackendHealth] = useState(null);
  
  // Service instances
  const [locationService] = useState(() => new LocationAPIService());
  const [backendService] = useState(() => new BackendService());
  
  const countries = [
    'All Countries', 'United Arab Emirates', 'United States', 'United Kingdom', 
    'Canada', 'Australia', 'Germany', 'France', 'Japan', 'India', 'China',
    'Brazil', 'Russia', 'South Africa', 'Egypt', 'Saudi Arabia', 'Turkey',
    'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Mexico', 'Argentina'
  ];

  const timezones = [
    'GMT-12', 'GMT-11', 'GMT-10', 'GMT-9', 'GMT-8', 'GMT-7', 'GMT-6', 
    'GMT-5', 'GMT-4', 'GMT-3', 'GMT-2', 'GMT-1', 'GMT+0', 'GMT+1', 
    'GMT+2', 'GMT+3', 'GMT+4', 'GMT+5', 'GMT+6', 'GMT+7', 'GMT+8', 
    'GMT+9', 'GMT+10', 'GMT+11', 'GMT+12'
  ];

  const cities = [
    { name: 'Dubai', country: 'United Arab Emirates', timezone: 'GMT+4' },
    { name: 'Abu Dhabi', country: 'United Arab Emirates', timezone: 'GMT+4' },
    { name: 'Sharjah', country: 'United Arab Emirates', timezone: 'GMT+4' },
    { name: 'New York', country: 'United States', timezone: 'GMT-5' },
    { name: 'Los Angeles', country: 'United States', timezone: 'GMT-8' },
    { name: 'London', country: 'United Kingdom', timezone: 'GMT+0' },
    { name: 'Paris', country: 'France', timezone: 'GMT+1' },
    { name: 'Tokyo', country: 'Japan', timezone: 'GMT+9' },
    { name: 'Sydney', country: 'Australia', timezone: 'GMT+11' },
    { name: 'Toronto', country: 'Canada', timezone: 'GMT-5' },
    { name: 'Berlin', country: 'Germany', timezone: 'GMT+1' },
    { name: 'Mumbai', country: 'India', timezone: 'GMT+5:30' },
    { name: 'Beijing', country: 'China', timezone: 'GMT+8' },
    { name: 'Moscow', country: 'Russia', timezone: 'GMT+3' },
    { name: 'Cairo', country: 'Egypt', timezone: 'GMT+2' },
  ];

  // Initialize component and detect location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Check backend health
        const isHealthy = await backendService.checkHealth();
        setBackendHealth(isHealthy);
        
        // Test endpoint if health check fails
        if (!isHealthy) {
          await backendService.testEndpoint();
        }
        
        // Try to detect location from IP
        const ipLocation = await locationService.detectLocationFromIP();
        if (ipLocation) {
          setDetectedLocation({
            name: ipLocation.name,
            isDetected: true
          });
        }
      } catch (error) {
        console.warn('Failed to initialize location:', error);
        setDetectedLocation({
          name: 'Location detection failed',
          isDetected: false
        });
      }
    };

    initializeLocation();
  }, [locationService, backendService]);

  // Clear messages after timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const getFilteredSuggestions = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const filtered = cities.filter(city => 
      city.name.toLowerCase().includes(query) || 
      city.country.toLowerCase().includes(query)
    );
    
    const matchingCountries = countries.filter(country => 
      country.toLowerCase().includes(query) && country !== 'All Countries'
    ).map(country => ({ name: country, country: country, timezone: 'GMT+0' }));
    
    return [...filtered, ...matchingCountries].slice(0, 8);
  };

  const useCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = position.coords;
      setMapCenter({ lat: latitude, lng: longitude });
      
      // Get location details and timezone
      const [geocodeResult, timezoneInfo] = await Promise.all([
        locationService.geocodeLocation(`${latitude},${longitude}`).catch(() => null),
        locationService.getTimezone(latitude, longitude)
      ]);
      
      const locationName = geocodeResult?.formattedAddress || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      const countryCode = geocodeResult?.country_code || '';
      
      setSelectedLocation({
        name: locationName,
        coordinates: `Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`,
        timezone: timezoneInfo.offset,
        localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        country_code: countryCode,
        elevation_meters: 0, // Default value, could be enhanced with elevation API
        light_pollution_level: 5 // Default value, could be enhanced with light pollution data
      });

      setSelectedTimezone(timezoneInfo.offset);
      setSuccess('Current location detected successfully!');
      
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Unable to get your current location. Please check your browser permissions.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendLocationToBackend = async () => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await backendService.submitLocation(selectedLocation);
      console.log('✅ Location saved:', result);
      setSuccess('Location saved successfully!');
    } catch (error) {
      console.error('❌ Error sending location:', error);
      setError(`Failed to save location: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && searchQuery.trim()) {
      setIsLoading(true);
      setError(null);

      try {
        const geocodeResult = await locationService.geocodeLocation(searchQuery);
        
        if (geocodeResult) {
          setMapCenter({ lat: geocodeResult.lat, lng: geocodeResult.lng });
          
          const timezoneInfo = await locationService.getTimezone(geocodeResult.lat, geocodeResult.lng);
          
          setSelectedTimezone(timezoneInfo.offset);
          setSelectedLocation({
            name: geocodeResult.formattedAddress,
            coordinates: `Lat ${geocodeResult.lat.toFixed(4)}, Lon ${geocodeResult.lng.toFixed(4)}`,
            timezone: timezoneInfo.offset,
            localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            country_code: geocodeResult.country_code || '',
            elevation_meters: 0, // Default value
            light_pollution_level: 5 // Default value
          });
          
          setSuccess(`Location found using ${geocodeResult.provider} service`);
        } else {
          throw new Error('Location not found');
        }
      } catch (error) {
        console.error('Search error:', error);
        setError(`Search failed: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion.name);
    setSelectedTimezone(suggestion.timezone);
    setIsLoading(true);
    setError(null);
    
    try {
      const geocodeResult = await locationService.geocodeLocation(suggestion.name);
      
      if (geocodeResult) {
        setMapCenter({ lat: geocodeResult.lat, lng: geocodeResult.lng });
        setSelectedLocation({
          name: geocodeResult.formattedAddress,
          coordinates: `Lat ${geocodeResult.lat.toFixed(4)}, Lon ${geocodeResult.lng.toFixed(4)}`,
          timezone: suggestion.timezone,
          localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          country_code: geocodeResult.country_code || '',
          elevation_meters: 0, // Default value
          light_pollution_level: 5 // Default value
        });
      } else {
        setSelectedLocation({
          name: suggestion.name,
          coordinates: 'Lat 25.20, Lon 55.45',
          timezone: suggestion.timezone,
          localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          country_code: '',
          elevation_meters: 0,
          light_pollution_level: 5
        });
      }
    } catch (error) {
      console.error('Suggestion selection error:', error);
      setError(`Failed to select location: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
    
    setShowSuggestions(false);
  };

  const handleMapClick = async (e) => {
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    
    setIsLoading(true);
    setError(null);

    try {
      const [geocodeResult, timezoneInfo] = await Promise.all([
        locationService.geocodeLocation(`${lat},${lng}`).catch(() => null),
        locationService.getTimezone(lat, lng)
      ]);

      const locationName = geocodeResult?.formattedAddress || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const countryCode = geocodeResult?.country_code || '';

      setSelectedTimezone(timezoneInfo.offset);
      setMapCenter({ lat, lng });
      setSelectedLocation({
        name: locationName,
        coordinates: `Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}`,
        timezone: timezoneInfo.offset,
        localTime: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        country_code: countryCode,
        elevation_meters: 0, // Default value
        light_pollution_level: 5 // Default value
      });
      
      setSuccess('Location selected from map');
    } catch (error) {
      console.error('Map click error:', error);
      setError(`Failed to get location details: ${error.message}`);
      
      // Fallback to basic location info
      setMapCenter({ lat, lng });
      setSelectedLocation({
        name: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coordinates: `Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}`,
        timezone: selectedTimezone,
        localTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        country_code: '',
        elevation_meters: 0,
        light_pollution_level: 5
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center my-10">
          <h1 className="text-2xl font-semibold mb-2">Change Your Location</h1>
          <p className="text-slate-400 text-sm">
            Set your location to see astronomy events visible in your area
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-200 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-600 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
            <span className="text-green-200 text-sm">{success}</span>
          </div>
        )}

        {/* Detected Location */}
        <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 flex items-center gap-4">
          <div className="flex items-center space-x-3 bg-slate-700 p-4 rounded-xl">
            <MapPin className="w-9 h-9 text-purple-400" />
          </div>
          <div className="p-3 flex-1 text-left">
            <h2 className="text-lg font-semibold text-slate-100">Detected Location</h2>
            <span className="text-sm font-medium text-gray-300">{detectedLocation.name}</span>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={useCurrentLocation}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                'Use Current'
              )}
            </Button>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
          <h2 className="text-xl text-left font-medium text-slate-100 mb-3">Search for a Location</h2>
          
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.trim().length > 0);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                onFocus={() => setShowSuggestions(searchQuery.trim().length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                disabled={isLoading}
                placeholder="Search for a city, region, or country..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400 disabled:opacity-50"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
              )}
            </div>

            {showSuggestions && getFilteredSuggestions().length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-slate-700 rounded-lg border border-slate-600 shadow-lg max-h-48 overflow-y-auto">
                {getFilteredSuggestions().map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 hover:bg-slate-600 cursor-pointer border-b border-slate-600 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{suggestion.name}</div>
                        <div className="text-xs text-slate-400">{suggestion.country}</div>
                      </div>
                      <div className="text-xs text-slate-400">{suggestion.timezone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4 space-y-3 text-left">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Filter by Country (Optional)</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50"
              >
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">Timezone</label>
              <select
                value={selectedTimezone}
                onChange={(e) => {
                  setSelectedTimezone(e.target.value);
                  if (selectedLocation.name) {
                    setSelectedLocation(prev => ({
                      ...prev,
                      timezone: e.target.value
                    }));
                  }
                }}
                disabled={isLoading}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white disabled:opacity-50"
              >
                {timezones.map(timezone => (
                  <option key={timezone} value={timezone}>{timezone}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-10">
            <span className="text-sm text-slate-300">Show map</span>
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 ${
                showMap ? 'bg-blue-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  showMap ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {showMap && (
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-medium text-slate-300">Map Picker</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Click on the map to select a location</span>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
            </div>
            
            {GOOGLE_MAPS_API_KEY ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  style={{ width: '100%', height: '300px', cursor: isLoading ? 'wait' : 'pointer' }}
                  center={mapCenter}
                  defaultZoom={10}
                  gestureHandling={'greedy'}
                  disableDefaultUI={true}
                  onClick={handleMapClick}
                  options={{
                    styles: [
                      {
                        featureType: 'all',
                        elementType: 'geometry.fill',
                        stylers: [{ color: '#1f2937' }]
                      },
                      {
                        featureType: 'water',
                        elementType: 'geometry',
                        stylers: [{ color: '#374151' }]
                      }
                    ]
                  }}
                >
                  <Marker 
                    position={mapCenter}
                    options={{
                      animation: window.google?.maps?.Animation?.BOUNCE
                    }}
                  />
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-80 bg-slate-700 rounded-lg border border-slate-600 relative cursor-crosshair overflow-hidden flex items-center justify-center">
                <div className="text-slate-400 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Google Maps API key not configured</p>
                  <p className="text-xs mt-1">Add VITE_GOOGLE_MAPS_API_KEY to your environment variables</p>
                  <p className="text-xs mt-2 text-slate-500">Using OpenStreetMap fallback for geocoding</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Location */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4">
          <h2 className="text-xl text-left font-medium text-slate-300 mb-3">Selected Location</h2>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-red-900 px-2 py-2 rounded-lg">
                <MapPin className="w-8 h-8 text-red-400 mt-0.5" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-md text-white mb-1">{selectedLocation.name}</h3>
                <p className="text-xs text-slate-100 mb-2">{selectedLocation.coordinates}</p>
                
                {/* Primary location info */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mt-4 mb-3">
                  <div className="flex gap-1">
                    <span>Timezone:</span> 
                    <span className="text-white">{selectedLocation.timezone}</span>
                  </div>
                  <div className="flex gap-1">
                    <span>Local Time:</span> 
                    <span className="text-white">{selectedLocation.localTime}</span>
                  </div>
                </div>
                
                {/* Additional location details */}
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-400 pt-3 border-t border-slate-600">
                  <div className="flex flex-col gap-1">
                    <span>Country:</span> 
                    <span className="text-white">{selectedLocation.country_code || 'Unknown'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Elevation:</span> 
                    <span className="text-white">{selectedLocation.elevation_meters}m</span>
                  </div>
                </div>
                
                {/* Light pollution scale info */}
                <div className="text-xs text-slate-500 mt-2">
                  Bortle Scale: 1=excellent dark sky, 9=inner city sky
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Set Location Button */}
        <div className="flex justify-center">
          <Button 
            onClick={sendLocationToBackend}
            disabled={isSubmitting || !backendHealth}
            variant='primary'
            className='flex items-center px-4 py-2 gap-3 flex-row-reverse disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Set Location</span>
              </>
            )}
          </Button>
        </div>

        {/* Retry Button for Failed Operations */}
        {error && (
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => {
                setError(null);
                setSuccess(null);
              }}
              variant='secondary'
              className='flex items-center px-4 py-2 gap-2'
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </Button>
            
            {/* Debug Button */}
            <Button 
              onClick={async () => {
                console.log('🐛 Starting debug session...');
                console.log('🐛 Backend base URL:', backendService.baseURL || 'relative URL');
                console.log('🐛 Selected location data:', selectedLocation);
                
                try {
                  await backendService.testEndpoint();
                  setSuccess('Debug info logged to console. Check browser developer tools.');
                } catch (error) {
                  setError(`Debug test failed: ${error.message}`);
                }
              }}
              variant='secondary'
              className='flex items-center px-4 py-2 gap-2 bg-yellow-600 hover:bg-yellow-700'
            >
              <AlertCircle className="w-4 h-4" />
              <span>Debug</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationChange;

