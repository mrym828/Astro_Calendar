import { X, MapPin, Clock, CircleAlert, Sun, Globe, Ruler } from 'lucide-react'; // Added Sun and Percent for illumination
import Badges from '../../components/common/Badges/Badges';

const Sidebar = ({ date, events, allEvents, onClose, isOpen }) => {
  const upcomingEvents = allEvents
    .filter(event => event.date.getTime() > date.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  

  return (
    <div
      className={`fixed top-0 right-0 bg-[#1F2E56] text-white h-full shadow-lg p-4 overflow-y-auto z-50
      transition-transform duration-400 ease-in-out
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      w-full sm:w-80 md:w-96 lg:w-1/3 xl:w-1/4`} 
    >
      <div className="flex justify-between items-center mb-8 mt-2">
        <h2 className="text-lg font-bold">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        <button className="cursor-pointer text-lg p-1 rounded-full hover:bg-white/10 transition-colors" onClick={onClose} aria-label="Close Sidebar">
          <X size={28} />
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-3">Events on this day:</h3>
      {events.length === 0 ? (
        <p className="text-sm text-gray-300 mb-6">No events scheduled for this day.</p>
      ) : (
        events.map(event => (
          <div key={event.title} className="mb-6 p-4 border rounded-lg bg-[#1E1E3C] border-white/50">
            <div className="flex justify-between items-start text-left mb-3">
              <div>
                <Badges variant={event.color} showDot={false} className="text-xs mb-2">
                  {event.type}
                </Badges>
                <h3 className="text-xl font-semibold">{event.title}</h3>
              </div>
              <div className="text-5xl">{event.icon}</div> {/* Larger icon */}
            </div>

            <div className="text-left text-sm space-y-2">
              {event.season && (
                <DetailRow icon={<Globe size={18} color={event.color} />} label="Season" value={event.season} />
              )}
              {event.distance && (
                <DetailRow icon={<Ruler size={18} color={event.color} />} label="Distance from Sun" value={`${event.distance_million_km} million km`} />
              )}
              {event.illumination !== undefined && event.illumination !== null && (
                <DetailRow icon={<Sun size={18} color={event.color} />} label="Illumination" value={`${(event.illumination*100).toFixed(0)}%`} />
              )}
              {event.bestViewing && (
                <DetailRow icon={<Clock size={18} color={event.color} />} label="Best Viewing Times" value={event.bestViewing} />
              )}
              {event.viewingDirection && (
                <DetailRow icon={<MapPin size={18} color={event.color} />} label="Viewing Direction" value={event.viewingDirection} />
              )}
              {event.description && (
                <DetailRow icon={<CircleAlert size={18} color={event.color} />} label="Details" value={event.description} />
              )}
            </div>
          </div>
        ))
      )}

      <h3 className="text-lg font-semibold my-4">Upcoming Events:</h3>
      {upcomingEvents.length === 0 ? (
        <p className="text-sm text-gray-300">No upcoming events found.</p>
      ) : (
        <ul className="space-y-3">
          {upcomingEvents.slice(0, 3).map(event => ( 
            <li key={event.title + event.date.getTime()} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="bg-[#312E81] border border-[#4338CA] rounded-lg w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0">
                {event.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-md text-gray-100 font-medium">{event.title}</span>
                <span className="text-xs text-gray-400">
                  {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {event.type}
                </span>
              </div>
            </li>
          ))}
          {upcomingEvents.length > 3 && (
            <li className="text-sm text-gray-400 text-center mt-2">
              ... and {upcomingEvents.length - 3} more upcoming events.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-2"> 
    <div className="flex-shrink-0 mt-0.5"> 
      {icon}
    </div>
    <div>
      <strong className="block text-gray-300">{label}:</strong>
      <span className="text-gray-200">{value}</span>
    </div>
  </div>
);

export default Sidebar;
