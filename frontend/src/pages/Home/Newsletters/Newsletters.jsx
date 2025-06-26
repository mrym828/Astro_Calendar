import {Bell, MapPin} from 'lucide-react';
import React, {useState} from 'react';
import Button from '../../../components/common/Button/Button'

const Newsletters = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = () => {
        if(email) {
            console.log('Subsribing email:', email);
            //handle logic later
            alert('Thank you for subscribing!');
            setEmail('');
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-blue-900/50 text-white py-16 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center text-left space-grotesk-font px-4">
        {/* Left Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Never Miss a Celestial Event
          </h2>
          
          <p className="text-md text-gray-300 leading-relaxed">
            Subscribe to our newsletter and get personalised notifications for 
            upcoming astronomical events in your area.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <input
              type="email"
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
            />
            <Button
              onClick={handleSubmit}
              variant='primary'
              className='w-55 button-gradient-new button-gradient-hover'
            >
              Subscribe Now
            </Button>
          </div>
        </div>

        <div className="space-y-15">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#312E81] rounded-lg flex items-center justify-center border-1 border-[#4338CA]">
              <Bell className="w-6 h-6 text-[#A5B4FC]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold ">Event Alerts</h3>
              <p className="text-gray-300 leading-relaxed">
                Get timely notifications for upcoming celestial events
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#312E81] rounded-lg flex items-center justify-center border-1 border-[#4338CA]">
              <MapPin className="w-6 h-6 text-[#A5B4FC]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Location-Based</h3>
              <p className="text-gray-300 leading-relaxed">
                Customized for your viewing location
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
};

export default Newsletters;