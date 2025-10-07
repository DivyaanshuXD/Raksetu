/**
 * Interactive Calendar Date Picker Component
 * Modern, accessible date picker with calendar UI
 */

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const DatePicker = ({ 
  value = '', 
  onChange, 
  minDate = new Date(), 
  maxDate = null,
  placeholder = 'Select date',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const containerRef = useRef(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setViewDate(new Date(value));
    }
  }, [value]);

  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    
    // Check if date is valid
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;

    setSelectedDate(newDate);
    const formattedDate = formatDate(newDate);
    onChange({ target: { value: formattedDate } });
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    onChange({ target: { value: '' } });
  };

  const isDateDisabled = (day) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(0, 0, 0, 0))) return true;
    return false;
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const weeks = [];
    let currentWeek = [];

    // Fill empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const today = isToday(day);
      const selected = isSelected(day);

      currentWeek.push(
        <button
          key={day}
          type="button"
          onClick={() => !disabled && handleDateSelect(day)}
          disabled={disabled}
          className={`
            h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium
            transition-all duration-150
            ${disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'hover:bg-red-50 hover:text-red-600 cursor-pointer'
            }
            ${selected 
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
              : ''
            }
            ${today && !selected 
              ? 'border-2 border-red-300 text-red-600' 
              : ''
            }
            ${!selected && !today && !disabled 
              ? 'text-gray-700' 
              : ''
            }
          `}
        >
          {day}
        </button>
      );

      // Start new week on Sunday
      if ((firstDay + day) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-1">
            {currentWeek}
          </div>
        );
        currentWeek = [];
      }
    }

    return weeks;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative w-full border rounded-lg p-2.5 flex items-center justify-between
          cursor-pointer transition-all duration-150
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed border-gray-300' 
            : 'bg-white border-gray-300 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
          }
        `}
      >
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={18} className={disabled ? 'text-gray-400' : 'text-gray-500'} />
          <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </div>
        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="font-semibold text-gray-900">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div 
                key={day} 
                className="h-10 w-10 flex items-center justify-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="space-y-1">
            {renderCalendar()}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>
              {minDate && `Min: ${formatDisplayDate(minDate)}`}
            </span>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                handleDateSelect(today.getDate());
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
