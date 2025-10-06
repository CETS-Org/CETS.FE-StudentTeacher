import { useEffect, useMemo, useState } from "react";
import { api } from "@/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

export type DaySchedule = {
  [dayValue: string]: string[]; // day -> array of selected time slot IDs (GUIDs)
};

interface ScheduleRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (daySchedules: DaySchedule) => void;
}

export default function ScheduleRegistrationDialog({ 
  isOpen, 
  onClose, 
  onSubmit 
}: ScheduleRegistrationDialogProps) {
  const [daySchedules, setDaySchedules] = useState<DaySchedule>({});

  // Available days for registration
  const dayOptions = [
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday', value: 'sunday' }
  ];

  // Time slots from backend lookups
  const [timeSlots, setTimeSlots] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getTimeSlots();
        // Controller returns list with LookUpId/Name; normalize
        const data = (res.data || []).map((x: any) => ({
          id: x.lookUpId ?? x.id ?? x.LookUpId ?? x.LookUpID,
          name: x.name ?? x.Name,
        })).filter((x: any) => !!x.id && !!x.name);
        setTimeSlots(data);
      } catch (e) {
        console.error('Failed to load time slots', e);
      }
    })();
  }, []);
  const timeSlotOptions = useMemo(() => timeSlots.map(ts => ({ label: ts.name, value: ts.id })), [timeSlots]);

  const handleDialogClose = () => {
    setDaySchedules({});
    onClose();
  };

  const handleDayToggle = (dayValue: string) => {
    setDaySchedules(prev => {
      const newSchedules = { ...prev };
      if (newSchedules[dayValue]) {
        // Remove the day and all its time slots
        delete newSchedules[dayValue];
      } else {
        // Add the day with empty time slots
        newSchedules[dayValue] = [];
      }
      return newSchedules;
    });
  };

  const handleTimeSlotToggle = (dayValue: string, timeSlotValue: string) => {
    setDaySchedules(prev => {
      const newSchedules = { ...prev };
      if (!newSchedules[dayValue]) {
        newSchedules[dayValue] = [];
      }
      
      const daySlots = newSchedules[dayValue];
      if (daySlots.includes(timeSlotValue)) {
        // Remove the time slot
        newSchedules[dayValue] = daySlots.filter(slot => slot !== timeSlotValue);
      } else {
        // Add the time slot
        newSchedules[dayValue] = [...daySlots, timeSlotValue];
      }
      
      return newSchedules;
    });
  };

  const handleSubmitRegistration = () => {
    const selectedDays = Object.keys(daySchedules);
    const totalSlots = selectedDays.reduce((total, day) => total + daySchedules[day].length, 0);
    
    if (selectedDays.length > 0 && totalSlots > 0) {
      onSubmit(daySchedules);
      handleDialogClose();
    }
  };

  // Helper functions for the UI
  const getSelectedDays = () => Object.keys(daySchedules);
  const getTotalSlots = () => getSelectedDays().reduce((total, day) => total + daySchedules[day].length, 0);
  const isDaySelected = (dayValue: string) => dayValue in daySchedules;
  const isTimeSlotSelected = (dayValue: string, timeSlotValue: string) => 
    daySchedules[dayValue]?.includes(timeSlotValue) || false;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Register for Schedule</DialogTitle>
          <DialogDescription>
            Select days and specific time slots for your teaching availability.
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Select Days and Time Slots
              </label>
              <p className="text-sm text-neutral-500 mb-4">
                Click on a day to select it, then choose specific time slots for that day.
              </p>
              
              <div className="space-y-4">
                {dayOptions.map((day) => (
                  <div
                    key={day.value}
                    className={`border rounded-lg transition-all ${
                      isDaySelected(day.value) 
                        ? 'border-accent-300 bg-neutral-100' 
                        : 'border-neutral-200 bg-white'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="p-4 border-b border-neutral-200">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isDaySelected(day.value)}
                          onChange={() => handleDayToggle(day.value)}
                          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-semibold text-neutral-900">
                          {day.label}
                        </span>
                        {isDaySelected(day.value) && daySchedules[day.value].length > 0 && (
                          <span className="text-xs bg-accent-100 text-primary-700 px-2 py-1 rounded-full">
                            {daySchedules[day.value].length} slot{daySchedules[day.value].length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </label>
                    </div>
                    
                    {/* Time Slots for this day */}
                    {isDaySelected(day.value) && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {timeSlotOptions.map((timeSlot) => (
                            <label
                              key={`${day.value}-${timeSlot.value}`}
                              className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent-100 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isTimeSlotSelected(day.value, timeSlot.value)}
                                onChange={() => handleTimeSlotToggle(day.value, timeSlot.value)}
                                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                              />
                              <span className="text-sm text-neutral-700">
                                {timeSlot.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            {getTotalSlots() > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-900 mb-2">Registration Summary</h4>
                <div className="text-sm text-green-700 space-y-2">
                  <p>
                    <strong>Selected Days:</strong> {getSelectedDays().length}
                  </p>
                  <p>
                    <strong>Total Time Slots:</strong> {getTotalSlots()}
                  </p>
                  <div className="mt-3 space-y-1">
                    {getSelectedDays().map(day => {
                      const dayLabel = dayOptions.find(d => d.value === day)?.label;
                      const slots = daySchedules[day];
                      return (
                        <div key={day} className="text-xs">
                          <strong>{dayLabel}:</strong> {slots.length} slot{slots.length !== 1 ? 's' : ''}
                          {slots.length > 0 && (
                            <span className="ml-2 text-green-600">
                              ({slots.map(slot => timeSlotOptions.find(t => t.value === slot)?.label).join(', ')})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogBody>
        
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={handleDialogClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitRegistration}
            disabled={getTotalSlots() === 0}
            className="hover:!bg-green-500"
          >
            Register ({getTotalSlots()} slot{getTotalSlots() !== 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
