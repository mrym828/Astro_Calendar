import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Dot, ToggleRight, ToggleLeft } from 'lucide-react';
import { EventsType } from '../../data/events';
import Badges from '../../components/common/Badges/Badges';
import Button from '../../components/common/Button/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Sidebar from './Sidebar';
import useMoonService from '../../Services/Moon_service';
import useEarthService from '../../Services/Earth_service';
import useEclipseService from '../../Services/Eclipse_service';
import useMoonPosService from '../../Services/moon_pos_service';
import moment from 'moment-hijri';

const hijriMonths = [
  'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
  'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

const gregorianToHijri = (gregorianDate) => {
  try {
    const hijriMoment = moment(gregorianDate).format('iYYYY/iMM/iDD');
    const [year, month, day] = hijriMoment.split('/').map(Number);
    return { year, month, day };
  } catch (error) {
    console.error('Error converting to Hijri with moment:', error);
    return null;
  }
};


const AstroCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const todayRef = useRef(null);
  const [calendarView, setCalendarView] = useState('Month');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {moonEvents, loading, error } = useMoonService();
  const [showHijri, setShowHijri] = useState(false);
  const {earthEvents, EarthEventsT, loading2, error2} = useEarthService();
  const { EclipsEvents, EclipseEventsT, loading: EclipseLoading, error: EclipseError } = useEclipseService();
  const { MoonPosEvents, MoonPosEventsT, loading: MoonLoading, error: MoonError } = useMoonPosService();

  const months = useMemo(() => [...Array(12).keys()].map(i => 
    new Date(0, i).toLocaleString('default', { month: 'long' })
  ), []);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    const prevMonthDays = Array(firstDay).fill(null).map((_, i) => {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
      const prevMonthLastDay = prevMonth.getDate();
      return { 
        day: prevMonthLastDay - firstDay + i + 1, 
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - firstDay + i + 1)
      };
    });
    
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({ 
      day: i + 1, 
      isCurrentMonth: true ,
      fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1)
    }));
    
    const totalCells = 42;
    const usedCells = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = Array(totalCells - usedCells).fill(null).map((_, i) => ({ 
      day: i + 1, 
      isCurrentMonth: false,
      isNextMonth: true,
      fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i + 1)
    }));

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentDate]);

  const filteredEvents = useMemo(() => {
    const combinedEvents = [...moonEvents, ...EarthEventsT, ...EclipseEventsT, ...MoonPosEventsT];

    return combinedEvents.filter(event => {
      const isTypeMatched = selectedTypes.size === 0 || selectedTypes.has(event.type);
      const isDateInRange = (!startDate || !endDate) || (event.date >= startDate && event.date <= endDate);
      return isTypeMatched && isDateInRange;
    });
  }, [selectedTypes, startDate, endDate, moonEvents, EarthEventsT, EclipseEventsT, MoonPosEventsT]);

  const getEventsForDay = (day) => {
    if (!day?.isCurrentMonth) return [];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayNum = day.day;
    const targetDate = new Date(year, month, dayNum);
    
    console.log('Target date:', targetDate.toDateString());
    console.log('All filtered events:', filteredEvents.map(e => ({ title: e.title, date: e.date.toDateString() })));

    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate());
      const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      
      const matches = eventDate.getTime() === targetDateOnly.getTime();
      
      if (matches) {
        console.log(`Event "${event.title}" matches date ${targetDate.toDateString()}`);
      }
      
      return matches;
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
      if (isNaN(newDate.getTime())) {
        return prevDate; 
      }
      return newDate;
    });
  };

  const handleDateClick = (dayObj) => {
    if (dayObj && dayObj.isCurrentMonth) {
      const newSelectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day);
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
  
useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        navigateMonth(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        navigateMonth(1);
        break;
      case 'Escape':
        setIsSidebarOpen(false);
        setShowSettings(false);
        break;
      case 't':
      case 'T':
        goToToday();
        break;
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
  const handleAddToCalendar = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `astronomy-calendar-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  };

  const getCurrentWeekDays = (date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
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

  const getSafeEventsForSelectedDate = () => {
    if (!selectedDate || isNaN(selectedDate.getTime())) return [];
    return getEventsForDay({ day: selectedDate.getDate(), isCurrentMonth: true });
  };

  const currentHijriDate = useMemo(() => gregorianToHijri(currentDate), [currentDate]);

  return (
    <div className="text-white min-h-screen p-4 sm:p-10 lg:p-9" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className='filters flex flex-col lg:flex-row max-w-7xl mx-auto gap-9 lg:gap-0'>
        <div className='flex flex-wrap gap-2 sm:gap-4 w-full lg:w-[50%]'>
          <button onClick={clearFilters} className="px-3 sm:px-5 py-1 text-sm rounded-full bg-[#312E81]/80 border border-[#4338CA]/80 cursor-pointer">
            All Events
          </button>
          {EventsType.map(type => (
            <button key={type.title} onClick={() => toggleEventType(type.title)}>
              <Badges showDot={true} variant={type.color} className={`cursor-pointer text-xs sm:text-sm ${selectedTypes.has(type.title) ? 'ring-2 ring-white/50' : ''}`}>{type.title}</Badges>
            </button>
          ))}
        </div>
        
        <div className='flex flex-row gap-2 items-start sm:items-center lg:ml-auto'>
          <div className='px-3 py-[6px] rounded-lg font-medium text-sm border border-[#4338CA]/50 text-white flex items-center bg-[#312E81]/50  justify-between w-full sm:w-auto'>
            <DatePicker
              selected={startDate}
              onChange={handleDateRangeChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              className="text-white/80 rounded-lg bg-transparent text-sm lg:w-full w-auto"
              placeholderText="Select Date Range"
            />
            <Calendar className='text-[#6750A4]' size={16} />
          </div>
          <div className='flex gap-1 sm:gap-2'>
            {['Month', 'Week', 'Day'].map(view => (
              <Button
                key={view}
                className={`px-2 sm:px-3 py-2 hover:bg-white/20 text-xs sm:text-sm ${calendarView === view ? 'bg-white/10 text-black' : ''}`}
                variant='secondary'
                onClick={() => setCalendarView(view)}
              >
                {view}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between my-6 sm:my-9 gap-4 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => navigateMonth(-1)} aria-label="Previous Month" className="p-2 hover:bg-gray-800 border-white border rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4 " />
          </button>
          <div className='text-center'>
          <h1 className="lg:text-xl text-lg font-bold text-center">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h1>
          {showHijri && (
            <p className='text-sm text-gray-400 mt-1'>
              {hijriMonths[currentHijriDate.month - 1]} {currentHijriDate.year} AH
            </p>
          )}
          </div>
          <button onClick={() => navigateMonth(1)} aria-label="Next Month" className="p-2 hover:bg-gray-800 border-white border rounded-full transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-400'>Hijri</span>
            <button
              onClick={()=>setShowHijri(!showHijri)}
              className='text-blue-400 hover:text-blue-300 transition-colors'
            >
              {showHijri ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
            </button>
          </div>
        <Button onClick={goToToday} className="bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-1 rounded-lg text-sm sm:text-lg font-medium transition-colors" variant='primary'>
          Today
        </Button>
      </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center py-2 text-xs sm:text-sm font-medium text-white/66">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
        {(calendarView === 'Month' ? calendarDays : getCurrentWeekDays(currentDate)).map((dayObj, index) => {
          if (!dayObj) return <div key={index} />;
          
          const isHidden = calendarView === 'Month' && startDate && endDate && !isInRange(dayObj);
          const isTodayFlag = isToday(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true });
          const isSelectedFlag = isSelected(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true });
          const hijriDate = dayObj.fullDate ? gregorianToHijri(dayObj.fullDate): null;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true })}
              disabled={!dayObj}
              ref={isTodayFlag ? todayRef : null}
              className={`aspect-square relative flex items-start px-1 sm:px-2 lg:px-3 py-2 sm:py-3 justify-start text-xs sm:text-sm rounded-lg transition-colors 
                ${isHidden ? 'opacity-0' : 'block'} 
                ${dayObj?.isCurrentMonth ? 'hover:bg-[#42406c] bg-[#232151]' : 'bg-[#1a1837] text-white/30 hover:bg-[#1a1837]'} 
                ${isTodayFlag ? 'bg-blue-800/90 text-white hover:bg-blue-600' : ''} 
                ${isSelectedFlag && !isTodayFlag ? 'bg-blue-900/80 text-blue-200' : ''}`}
            >

              {calendarView === 'Month' ? dayObj?.day : dayObj.fullDate?.getDate()}
              <div className="absolute mt-4 sm:mt-6 space-y-0.5 sm:space-y-1 left-0.5 sm:left-1 top-4 sm:top-6 right-0.5 sm:right-1">
              {getEventsForDay(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true })
              .filter(event => event.type === 'Moon Phase')
              .map((event, idx) => (
                <div key={`moon-${idx}`} className="absolute top-21 left-0 text-lg lg:text-3xl">
                  <span>{event.icon}</span>
                </div>
              ))}

            <div className="absolute mt-4 sm:mt-6 space-y-0.5 sm:space-y-1 left-0.5 sm:left-1 top-4 sm:top-6 right-0.5 sm:right-1">
              {getEventsForDay(calendarView === 'Month' ? dayObj : { day: dayObj.fullDate?.getDate(), isCurrentMonth: true })
                .filter(event => event.type !== 'Moon Phase')
                .map((event, idx) => (
                  <div
                    key={idx}
                    className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-0.5 rounded flex items-center gap-1 sm:gap-2 text-white overflow-hidden w-full justify-left mt-0.5"
                    style={{ backgroundColor: event.color }}
                  >
                    <span className="text-[8px] sm:text-xs">{event.icon}</span>
                    <span className="truncate hidden sm:inline">{event.title}</span>
                  </div>
                ))}
            </div>
            </div>

              <div className='flex flex-col items-end w-full'>
                {showHijri && hijriDate &&(
                  <span className='text-[10px] text-gray-400 mt-1'>
                    {hijriDate.day}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>


      <div className='flex flex-col-reverse lg:flex-row-reverse justify-between items-center lg:my-10'>
        <Button onClick={() => handleAddToCalendar()} className="px-2 py-1 text-sm mt-4 flex gap-2 items-center lg:text-[18px]" variant='primary'>
          <Calendar size={22} />
          Add to Calendar
        </Button>
        <div className="flex flex-row mt-4 items-center">
          {EventsType.map(event => (
            <div key={event.title} className="flex items-center mr-3">
              <Dot strokeWidth={8} style={{ color: event.color }} />
              <span className="py-1 rounded-full text-white text-[10px] lg:text-sm ml-1">{event.title}</span>
            </div>
          ))}
        </div>
      </div>

      {isSidebarOpen && selectedDate && (
        <>
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
          <Sidebar 
            date={selectedDate} 
            events={getSafeEventsForSelectedDate()} 
            allEvents={filteredEvents}
            onClose={() => setIsSidebarOpen(false)} 
            isOpen={isSidebarOpen}
          />
        </>
      )}
    </div>
  );
};

export default AstroCalendar;