import React, { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Dot } from 'lucide-react';
import { EventsType } from '../../data/events';
import Badges from '../../components/common/Badges/Badges';
import Button from '../../components/common/Button/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from './Sidebar';

// Sample Events - Fixed date constructor (months are 0-indexed)
const allEvents = [
  { title: 'Lyrid Meteor Shower', date: new Date(2025, 5, 23), type: 'Meteor Shower', color: 'green', icon: '☄️' },
  { title: 'First Quarter Moon', date: new Date(2025, 5, 23), type: 'Moon Phase', color: 'blue', icon: '🌓' },
  { title: 'Lyrid Meteor Shower', date: new Date(2025, 5, 24), type: 'Meteor Shower', color: 'green', icon: '☄️' },
  { title: 'ISS Visible Pass', date: new Date(2025, 6, 27), type: 'Special Events', color: 'yellow', icon: '🛰️' },
  { title: 'New Moon', date: new Date(2025, 6, 30), type: 'Moon Phase', color: 'blue', icon: '🌑' },
  // Added some August events for testing
  { title: 'Perseid Meteor Shower', date: new Date(2025, 7, 12), type: 'Meteor Shower', color: 'green', icon: '☄️' },
  { title: 'Full Moon', date: new Date(2025, 7, 15), type: 'Moon Phase', color: 'blue', icon: '🌕' },
  { title: 'Saturn at Opposition', date: new Date(2025, 7, 20), type: 'Special Events', color: 'yellow', icon: '🪐' }
];

const AstroCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const todayRef = useRef(null);
  const [calendarView, setCalendarView] = useState('Month'); // 'Month' | 'Week'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const months = useMemo(() => [...Array(12).keys()].map(i => 
    new Date(0, i).toLocaleString('default', { month: 'long' })
  ), []);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    // Create array for previous month's trailing days
    const prevMonthDays = Array(firstDay).fill(null).map((_, i) => {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
      const prevMonthLastDay = prevMonth.getDate();
      return { 
        day: prevMonthLastDay - firstDay + i + 1, 
        isCurrentMonth: false,
        isPrevMonth: true 
      };
    });
    
    // Create array for current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({ 
      day: i + 1, 
      isCurrentMonth: true 
    }));
    
    // Create array for next month's leading days
    const totalCells = 42;
    const usedCells = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = Array(totalCells - usedCells).fill(null).map((_, i) => ({ 
      day: i + 1, 
      isCurrentMonth: false,
      isNextMonth: true 
    }));

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    const events = selectedTypes.size === 0 ? allEvents : allEvents.filter(event => selectedTypes.has(event.type));
    
    if (startDate && endDate) {
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }
    
    return events;
  }, [selectedTypes, startDate, endDate]);

  const getEventsForDay = (day) => {
    if (!day?.isCurrentMonth) return [];
    
    // Safe date creation with validation
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayNum = day.day;
    
    // Validate inputs
    if (isNaN(year) || isNaN(month) || isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      return [];
    }
    
    const dayDate = new Date(year, month, dayNum);
    
    // Additional validation to ensure the date was created correctly
    if (isNaN(dayDate.getTime())) {
      return [];
    }
    
    return filteredEvents.filter(event => {
      // Ensure event.date is valid
      if (!event.date || isNaN(event.date.getTime())) {
        return false;
      }
      
      return event.date.getFullYear() === dayDate.getFullYear() &&
             event.date.getMonth() === dayDate.getMonth() &&
             event.date.getDate() === dayDate.getDate();
    });
  };

  const toggleEventType = (type) => {
    setSelectedTypes(prev => {
      const newTypes = new Set(prev);
      newTypes.has(type) ? newTypes.delete(type) : newTypes.add(type);
      return newTypes;
    });
  };

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setStartDate(null);
    setEndDate(null);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + direction, 1);
      // Validate the new date
      if (isNaN(newDate.getTime())) {
        return prevDate; // Return previous date if invalid
      }
      return newDate;
    });
  };

  const handleDateClick = (dayObj) => {
    if (dayObj && dayObj.isCurrentMonth) {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day);
      // Validate the date before setting
      if (!isNaN(newSelectedDate.getTime())) {
        setSelectedDate(newSelectedDate);
        setIsSidebarOpen(true);
      }
    }
  };

  const isToday = (dayObj) => {
    const today = new Date();
    return (
      dayObj &&
      dayObj.isCurrentMonth &&
      today.getDate() === dayObj.day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isSelected = (dayObj) => {
    return (
      selectedDate &&
      dayObj &&
      dayObj.isCurrentMonth &&
      selectedDate.getDate() === dayObj.day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const isInRange = (dayObj) => {
    if (!startDate || !endDate || !dayObj?.isCurrentMonth) return false;
    
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day);
    if (isNaN(dayDate.getTime())) return false;
    
    return dayDate >= startDate && dayDate <= endDate;
  };

  const handleDateRangeChange = (dates) => {
    const [start, end] = Array.isArray(dates) ? dates : [dates, null];
    setStartDate(start instanceof Date && !isNaN(start.getTime()) ? start : null);
    setEndDate(end instanceof Date && !isNaN(end.getTime()) ? end : null);
    
    if (start && !end && !isNaN(start.getTime())) {
      const startMonth = start.getMonth();
      const startYear = start.getFullYear();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      if (startMonth !== currentMonth || startYear !== currentYear) {
        requestAnimationFrame(() => {
          setCurrentDate(new Date(startYear, startMonth, 1));
        });
      }
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
    clearFilters();
    
    setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
        
        todayRef.current.style.transform = 'scale(1.1)';
        todayRef.current.style.transition = 'transform 0.3s ease-in-out';
        
        setTimeout(() => {
          if (todayRef.current) {
            todayRef.current.style.transform = 'scale(1)';
          }
        }, 300);
      }
    }, 100);
  };

  const handleAddToCalendar = (event) => {
    alert(`Added ${event.title} to your calendar!`);
  };

  const getCurrentWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        day: d.getDate(),
        fullDate: d,
        isCurrentMonth: d.getMonth() === date.getMonth(),
      };
    });
  };

  // Safe event selection for sidebar
  const getSafeEventsForSelectedDate = () => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return [];
    return getEventsForDay({ day: selectedDate.getDate(), isCurrentMonth: true });
  };

  return (
    <div className="text-white min-h-screen p-9" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className='filters flex max-w-7xl mx-auto'>
        <div className='flex flex-wrap gap-3 w-[50%]'>
          <button onClick={clearFilters} className="px-4 py-1 rounded-full bg-[#312E81]/80 border border-[#4338CA]/80 cursor-pointer">
            All Events
          </button>
          {EventsType.map(type => (
            <button key={type.title} onClick={() => toggleEventType(type.title)}>
              <Badges variant={type.color} className={`cursor-pointer ${selectedTypes.has(type.title) ? 'ring-2 ring-white/50' : ''}`}>{type.title}</Badges>
            </button>
          ))}
        </div>
        <div className='flex gap-2 items-center ml-auto'>
          <div className='px-3 py-[6px] rounded-lg font-medium text-sm border border-[#4338CA]/50 text-white flex items-center bg-[#312E81]/50 gap-2'>
            <DatePicker
              selected={startDate}
              onChange={handleDateRangeChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="text-white/80 rounded-lg"
              placeholderText="Select Date Range"
            />
            <Calendar className='text-[#6750A4]' size={16} />
          </div>
          {['Month', 'Week', 'Day'].map(view => (
            <Button
              key={view}
              className={`px-3 py-2 hover:bg-white/20 text-sm ${calendarView === view ? 'bg-white/10 text-black' : ''}`}
              variant='secondary'
              onClick={() => setCalendarView(view)}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between my-9">
        <div className="flex items-center gap-4">
          <button onClick={() => navigateMonth(-1)} aria-label="Previous Month" className="p-2 hover:bg-gray-800 border-white border rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h1>
          <button onClick={() => navigateMonth(1)} aria-label="Next Month" className="p-2 hover:bg-gray-800 border-white border rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <Button onClick={goToToday} className="bg-blue-600 hover:bg-blue-700 px-6 py-1 rounded-lg text-lg font-medium transition-colors" variant='primary'>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium text-white/66">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {(calendarView === 'Month' ? calendarDays : getCurrentWeekDays(currentDate)).map((dayObj, index) => {
          if (!dayObj) return <div key={index} />; // Safety check
          
          const isHidden = calendarView === 'Month' && startDate && endDate && !isInRange(dayObj);
          const isTodayFlag = isToday(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true });
          const isSelectedFlag = isSelected(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true });

          return (
            <button
              key={index}
              onClick={() => handleDateClick(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true })}
              disabled={!dayObj}
              ref={isTodayFlag ? todayRef : null}
              className={`aspect-square relative flex items-start px-3 py-3 justify-start text-sm rounded-lg transition-colors ${isHidden ? 'opacity-0' : 'block'} ${dayObj?.isCurrentMonth ? 'hover:bg-[#42406c] bg-[#232151]' : 'bg-[#1a1837] text-white/30 hover:bg-[#1a1837]'} ${isTodayFlag ? 'bg-blue-800/90 text-white hover:bg-blue-600' : ''} ${isSelectedFlag && !isTodayFlag ? 'bg-blue-900/80 text-blue-200' : ''}`}
            >
              {calendarView === 'Month' ? dayObj?.day : dayObj.fullDate?.getDate()}
              <div className="absolute mt-6 space-y-1 left-1 top-6">
                {getEventsForDay(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true }).map((event, idx) => (
                  <div key={idx} className="text-xs px-1 py-0.5 rounded text-white" style={{ backgroundColor: event.color }}>
                    {event.title}
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className='flex flex-row-reverse justify-between items-center my-10'>
        <Button onClick={() => handleAddToCalendar(allEvents[0])} className="px-2 py-1 mt-4 flex gap-2 items-center text-[18px]" variant='primary'>
          <Calendar size={22} />
          Add to Calendar
        </Button>
        <div className="flex flex-row mt-4 items-center">
          {EventsType.map(event => (
            <div key={event.title} className="flex items-center mr-3">
              <Dot strokeWidth={8} style={{ color: event.color }} />
              <span className="py-1 rounded-full text-white text-sm ml-1">{event.title}</span>
            </div>
          ))}
        </div>
      </div>

      {isSidebarOpen && selectedDate && (
        <>
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40" />
          <Sidebar 
            date={selectedDate} 
            events={getSafeEventsForSelectedDate()} 
            allEvents={allEvents}
            onClose={() => setIsSidebarOpen(false)} 
          />
        </>
      )}
    </div>
  );
};

export default AstroCalendar;