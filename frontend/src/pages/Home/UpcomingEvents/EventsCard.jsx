import React from 'react';
import Badges from '../../../components/common/Badges/Badges';
import { ChevronRight} from 'lucide-react';

const EventsCard = ({ title, date, description, badge, badgeColor, image }) => {
  return (
    <>
    <div className="bg-[#1E1E3C] p-6 rounded-xl border-[1pt] border-white/25 flex flex-col justify-between h-full space-grotesk-font">
    <div className='flex justify-between mb-3'>
        <div className='w-[60%]'>
            <div className='mb-2'>
            <Badges variant={badgeColor} className='w-[55%] justify-center' showDot={false}>
                {badge}
            </Badges>
            </div>
            <h3 className="text-[22px] text-left font-semibold">{title}</h3>
            <p className="text-gray-400 text-left text-sm">{date}</p>
        </div>
        <div>
            <img src={image} alt={title} className="w-25 h-25 rounded-full object-cover" />
        </div>
    </div><p className="text-sm text-left text-white mb-6">{description}</p><div className="flex items-center justify-between">
            <a href="#" className="text-[#818CF8] font-medium hover:underline text-md flex items-center gap-2">More Details <ChevronRight/></a>
        </div>
        </div>
        </>
    );
};

export default EventsCard;
