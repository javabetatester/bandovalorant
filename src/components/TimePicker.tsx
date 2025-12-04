import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const getInitialValues = () => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      return { hour: h.replace(/^0+/, '') || '0', minute: m.replace(/^0+/, '') || '0' };
    }
    const now = new Date();
    return {
      hour: now.getHours().toString(),
      minute: now.getMinutes().toString()
    };
  };

  const initial = getInitialValues();
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      const newHour = h.replace(/^0+/, '') || '0';
      const newMinute = m.replace(/^0+/, '') || '0';
      if (newHour !== hour) setHour(newHour);
      if (newMinute !== minute) setMinute(newMinute);
    }
  }, [value]);

  const handleHourFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleMinuteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    
    if (val === '') {
      setHour('');
      return;
    }
    
    const num = parseInt(val);
    if (num >= 0 && num <= 23) {
      setHour(val.replace(/^0+/, '') || '0');
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    
    if (val === '') {
      setMinute('');
      return;
    }
    
    const num = parseInt(val);
    if (num >= 0 && num <= 59) {
      setMinute(val.replace(/^0+/, '') || '0');
    }
  };

  const handleHourBlur = () => {
    let h = hour;
    if (h === '' || !h) {
      h = '0';
    }
    const num = parseInt(h) || 0;
    const clamped = Math.max(0, Math.min(23, num));
    const formatted = clamped.toString().padStart(2, '0');
    setHour(formatted);
    
    const m = minute === '' || !minute ? '00' : parseInt(minute).toString().padStart(2, '0');
    onChange(`${formatted}:${m}`);
  };

  const handleMinuteBlur = () => {
    let m = minute;
    if (m === '' || !m) {
      m = '0';
    }
    const num = parseInt(m) || 0;
    const clamped = Math.max(0, Math.min(59, num));
    const formatted = clamped.toString().padStart(2, '0');
    setMinute(formatted);
    
    const h = hour === '' || !hour ? '00' : parseInt(hour).toString().padStart(2, '0');
    onChange(`${h}:${formatted}`);
  };

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 text-red-500 font-semibold text-sm uppercase tracking-wider mb-3">
        <Clock size={18} />
        Horário do Jogo
      </label>
      <div className="bg-black/50 border border-gray-700 rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={hour}
              onChange={handleHourChange}
              onFocus={handleHourFocus}
              onBlur={handleHourBlur}
              className="w-16 sm:w-20 text-center bg-black/70 border-2 border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-2xl sm:text-3xl font-bold focus:outline-none focus:border-red-500 transition-colors"
              placeholder="00"
            />
            <span className="text-red-500 font-bold text-2xl sm:text-3xl">:</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={minute}
              onChange={handleMinuteChange}
              onFocus={handleMinuteFocus}
              onBlur={handleMinuteBlur}
              className="w-16 sm:w-20 text-center bg-black/70 border-2 border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-2xl sm:text-3xl font-bold focus:outline-none focus:border-red-500 transition-colors"
              placeholder="00"
            />
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="inline-block bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
            <span className="text-white font-bold text-lg sm:text-xl">
              {(hour || '0').padStart(2, '0')}:{(minute || '0').padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}