import { Calendar } from 'lucide-react';
import EventsCard from './EventsCard';

const EventGrid = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md mx-auto">
          <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
          <p className="text-gray-400">Try adjusting your filters or search terms to find more events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map(event => (
        <EventsCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventGrid;