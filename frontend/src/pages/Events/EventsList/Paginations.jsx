import { ChevronLeft, ChevronRight } from 'lucide-react';


const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-2 text-white/70 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed border border-white/20 hover:border-white/40 disabled:border-white/10 rounded-lg transition-colors bg-slate-800/50 backdrop-blur-sm"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-[40px] h-[40px] rounded-lg transition-colors ${
              currentPage === page
                ? 'bg-gradient-to-b from-[#2A5EAC] to-[#4B2C94] text-white border border-[#2F2869]'
                : 'text-white/70 hover:text-white border border-white/20 hover:border-white/40 bg-slate-800/50 backdrop-blur-sm'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-2 text-white/70 hover:text-white disabled:text-white/30 disabled:cursor-not-allowed border border-white/20 hover:border-white/40 disabled:border-white/10 rounded-lg transition-colors bg-slate-800/50 backdrop-blur-sm"
      >
        
        <ChevronRight size={22} />
      </button>
    </div>
  );
};

export default Pagination;