import { Dot } from "lucide-react";

const Badges = ({ children, variant = 'primary', className = '', showDot=true}) => {
  const variants = {
    primary: 'absolute top-0 right-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-sm font-bold px-5 py-[2pt] rounded-bl-2xl shadow-lg z-20 uppercase',
    '#253A7C': 'bg-[#253A7C] text-[#BFDBFE]  font-bold px-5 py-1 rounded-full shadow-lg z-20 justify-center',
    red: ' bg-[#7F1D1D] text-[#FECACA]  font-bold px-3 py-1 rounded-full shadow-lg z-20 justify-center',
    green: ' bg-[#14532D] text-[#BBF7D0] font-bold px-3 py-1 rounded-full shadow-lg z-20 justify-center',
    purple: ' bg-[#581C87] text-[#E9D5FF] font-bold px-3 py-1 rounded-full shadow-lg z-20 justify-center',
    brown: ' bg-[#a52a2a]/50 text-[#D7BFAE]  font-bold px-4 py-1 rounded-full shadow-lg z-20 justify-center',
    yellow: ' bg-[#78350F] text-[#FECACA] font-bold px-3 py-1 rounded-full shadow-lg z-20 justify-center',
  };

  

  return (
    <div className={`${variants[variant]} ${className} flex items-center pr-5`}>
      {showDot && <Dot className="w-5 h-5 scale-220" />}
      {children}
    </div>
  );
};

export default Badges;