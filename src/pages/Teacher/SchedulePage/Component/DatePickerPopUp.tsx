// src/components/ui/DatePicker.tsx

import { useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import 'react-day-picker/dist/style.css'; // Import CSS mặc định

export default function DatePicker() {
  // State để lưu ngày được chọn, mặc định là ngày hôm nay
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="w-full max-w-xs">
      <label htmlFor="date-input" className="block text-sm font-medium text-purple-800 mb-1">
        Date
      </label>
      <Popover className="relative">
        {({ close }) => (
          <>
            <PopoverButton
              id="date-input"
              className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span>
                {selectedDate ? format(selectedDate, 'MM/dd/yyyy') : 'Select a date'}
              </span>
              <CalendarIcon className="h-4 w-4 text-gray-500" />
            </PopoverButton>
            <p className="text-xs text-gray-500 mt-1">MM/DD/YYYY</p>
            
            <PopoverPanel 
              anchor="bottom"
              className="z-10 mt-2 bg-white rounded-lg shadow-lg border p-4"
            >
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    close(); // Tự động đóng popup sau khi chọn
                  }
                }}
                defaultMonth={selectedDate} // Mở lịch ở tháng của ngày được chọn
                showOutsideDays // Hiển thị ngày của tháng trước/sau
                // Tùy chỉnh class để giống hình ảnh
                classNames={{
                  caption: 'flex justify-center items-center mb-4 relative',
                  caption_label: 'text-base font-semibold',
                  nav: 'flex items-center',
                  nav_button: 'h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100',
                  nav_button_previous: 'absolute left-0',
                  nav_button_next: 'absolute right-0',
                  table: 'w-full border-collapse',
                  head_row: 'flex mb-2',
                  head_cell: 'w-9 text-sm font-medium text-gray-500',
                  row: 'flex w-full mt-2',
                  cell: 'flex-1 text-center',
                  day: 'h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer',
                  day_today: 'bg-gray-100 font-bold', // Style cho ngày hôm nay
                  day_selected: 'bg-purple-600 text-white hover:bg-purple-700', // Style cho ngày được chọn
                  day_outside: 'text-gray-300',
                }}
              />
               <div className="flex justify-end gap-2 mt-4">
                  <button onClick={close} className="text-sm font-medium text-gray-600 hover:text-black px-4 py-1">Cancel</button>
                  <button onClick={close} className="text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-1 rounded-md">OK</button>
                </div>
            </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  );
}