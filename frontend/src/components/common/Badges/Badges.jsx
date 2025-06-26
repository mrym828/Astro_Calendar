const Badges = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'absolute top-0 right-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-sm font-bold px-5 py-[2pt] rounded-bl-2xl shadow-lg z-20 uppercase',
    blue: 'bg-[#1E3A8A] text-[#BFDBFE] text-[15px] font-bold px-2 py-1 rounded-full shadow-lg z-20',
    red: ' bg-[#7F1D1D] text-[#FECACA] text-[15px] font-bold px-3 py-1 rounded-full shadow-lg z-20',
    green: ' bg-[#14532D] text-[#BBF7D0] text-[15px] font-bold px-3 py-1 rounded-full shadow-lg z-20',
    purple: ' bg-[#581C87] text-[#E9D5FF] text-[15px] font-bold px-3 py-1 rounded-full shadow-lg z-20',
    brown: ' bg-[#3E2723] text-[#D7BFAE] text-[15px] font-bold px-3 py-1 rounded-full shadow-lg z-20',
    yellow: ' bg-[#78350F] text-[#FECACA] text-[15px] font-bold px-3 py-1 rounded-full shadow-lg z-20',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export default Badges;