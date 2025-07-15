import { 
  Bell, 
  MapPin, 
  Mail, 
  Check, 
  Calendar,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Button from '../../../components/common/Button/Button';

const Newsletters = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [preferences, setPreferences] = useState({
    events: true,
    weather: true,
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Subscribing email:', email, 'with preferences:', preferences);
      setIsSubscribed(true);
      setEmail('');
      setEmailError('');
    } catch (error) {
      setEmailError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const features = [
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get personalized alerts for events visible from your location",
      color: "text-blue-400"
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description: "Customized content based on your viewing location and timezone",
      color: "text-green-400"
    },
    {
      icon: Calendar,
      title: "Event Calendar",
      description: "Never miss important astronomical events with our calendar integration",
      color: "text-purple-400"
    },
  ];



  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-blue-900/50 text-white py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-grotesk-font">
          <div className="bg-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Welcome to the Community!</h2>
          <p className="text-lg text-gray-300 mb-8">
            Thank you for subscribing! You'll receive your first newsletter within 24 hours.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-2xl font-bold text-blue-400">{stat.number}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-blue-900/40 text-white py-8 px-6 lg:px-8 relative overflow-hidden ">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-left space-grotesk-font">
            <div>              
              <h2 className="text-2xl lg:text-3xl font-bold leading-tight mb-6">
                Never Miss a 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}Celestial Event
                </span>
              </h2>
              
              <p className="text-[15px] text-gray-300 leading-relaxed mb-8">
                Join our community of astronomy enthusiasts and get personalized notifications 
                for upcoming astronomical events, weather updates, and exclusive content.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-12 pr-4 py-4 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all ${
                        emailError 
                          ? 'border-red-400 focus:ring-red-400' 
                          : 'border-white/20 focus:ring-blue-400'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-400 text-sm mt-2">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Notification Preferences</label>
                  <div className="flex gap-5">
                    {Object.entries(preferences).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handlePreferenceChange(key)}
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm capitalize">
                          {key === 'events' && 'Astronomical Events'}
                          {key === 'weather' && 'Weather Updates'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !!emailError}
                  variant='primary'
                  className='w-full py-4 button-gradient-new button-gradient-hover disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </div>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  By subscribing, you agree to our privacy policy. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 space-grotesk-font">Why Subscribe?</h3>
            <div className="grid gap-4 text-left">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Newsletters;

