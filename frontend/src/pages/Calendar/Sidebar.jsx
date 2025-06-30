import { X, MapPin, Clock, CircleAlert } from 'lucide-react';
import Badges from '../../components/common/Badges/Badges';

const Sidebar = ({ date, events, allEvents, onClose }) => {
  const upcomingEvents = allEvents.filter(event => event.date > date);

  return (
    <div className="fixed top-0 right-0 bg-[#1F2E56] text-white w-80 h-full shadow-lg p-4 overflow-y-auto z-50 transition duration-300 ease-in-out translate-x-0">
      {/* Header */}
      <div className="flex flex-row-reverse justify-between items-center mb-10 mt-2">
        <button className="cursor-pointer text-lg" onClick={onClose} aria-label="Close Sidebar">
          <X size={30} />
        </button>
        <h2 className="text-xl">{date.toLocaleDateString()}</h2>
      </div>

      {/* Events for Selected Date */}
      {events.map(event => (
        <div key={event.title} className="mb-4 p-3 border rounded-lg bg-[#1E1E3C] border-white/50">
          <div className="flex justify-between items-start text-left">
            <div className="p-2">
              <Badges variant={event.color} showDot={false} className="text-xs w-[120px] mb-2">
                {event.type}
              </Badges>
              <h3 className="text-[16px] font-semibold">{event.title}</h3>
              <div className="text-xs text-gray-400">Type: {event.type}</div>
            </div>
            <div className="text-4xl pr-2">{event.icon}</div>
          </div>

          <div className="text-left text-sm mt-2 space-y-2">
            <DetailRow icon={<Clock size={18} color={event.color} />} label="Best Viewing Times" value={event.bestViewing || "N/A"} />
            <DetailRow icon={<MapPin size={18} color={event.color} />} label="Viewing Direction" value={event.viewingDirection || "N/A"} />
            <DetailRow icon={<CircleAlert size={18} color={event.color} />} label="Details" value={event.details || "No additional details available."} />
          </div>
        </div>
      ))}

      {/* Upcoming Events Section */}
      <h3 className="text-lg font-semibold my-4">Upcoming Events</h3>
      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-gray-300">No upcoming events.</p>
      ) : (
        <ul className="space-y-3">
          {upcomingEvents.map(event => (
            <li key={event.title} className="flex items-center gap-3">
              <div className="bg-[#312E81] border border-[#4338CA] rounded-lg w-10 h-10 flex items-center justify-center text-2xl">
                {event.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-md text-gray-100">{event.title}</span>
                <span className="text-xs text-gray-400 flex">{event.date.toLocaleDateString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// DetailRow Component
const DetailRow = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2">
      {icon}
      <strong>{label}</strong>
    </div>
    <div className="pl-[26px]">{value}</div>
  </div>
);

export default Sidebar;
