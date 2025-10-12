import { useEffect, useMemo, useState } from "react";
import { api } from "@/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { getTeacherId } from "@/lib/utils";
import { Trash2, AlertCircle } from "lucide-react";
import type { 
  DaySchedule, 
  TeacherAvailability, 
  ScheduleRegistrationDialogProps 
} from "@/types/teacherSchedule";

export default function ScheduleRegistrationDialog({ 
  isOpen, 
  onClose, 
  onSubmit 
}: ScheduleRegistrationDialogProps) {
  const [daySchedules, setDaySchedules] = useState<DaySchedule>({});
  const [registeredSlots, setRegisteredSlots] = useState<TeacherAvailability[]>([]);
  const [slotsToUnregister, setSlotsToUnregister] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if current date is past the 10th of the month
  const isPastDeadline = (): boolean => {
    const today = new Date();
    return today.getDate() > 10;
  };

  const canMakeChanges = !isPastDeadline();

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
  
  // Fetch time slots and registered availability when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        setLoading(true);
        
        // Fetch time slots
        const timeSlotsRes = await api.getTimeSlots();
        const timeSlotsData = (timeSlotsRes.data || []).map((x: any) => ({
          id: x.lookUpId ?? x.id ?? x.LookUpId ?? x.LookUpID,
          name: x.name ?? x.Name,
        })).filter((x: any) => !!x.id && !!x.name);
        setTimeSlots(timeSlotsData);

        // Fetch teacher's registered availability
        const teacherId = getTeacherId();
        if (teacherId) {
          const availabilityRes = await api.getTeacherAvailabilityByTeacher(teacherId);
          setRegisteredSlots(availabilityRes.data || []);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);
  const timeSlotOptions = useMemo(() => timeSlots.map(ts => ({ label: ts.name, value: ts.id })), [timeSlots]);

  const handleDialogClose = () => {
    setDaySchedules({});
    setSlotsToUnregister(new Set());
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

  const handleToggleUnregister = (slotId: string) => {
    if (!canMakeChanges) return;
    
    setSlotsToUnregister(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  };

  const handleSubmitRegistration = async () => {
    const selectedDays = Object.keys(daySchedules);
    const totalSlots = selectedDays.reduce((total, day) => total + daySchedules[day].length, 0);
    const totalUnregistrations = slotsToUnregister.size;
    
    if ((selectedDays.length === 0 || totalSlots === 0) && totalUnregistrations === 0) {
      return;
    }

    setIsDeleting(true);
    try {
      // First, handle unregistrations
      if (totalUnregistrations > 0) {
        for (const slotId of Array.from(slotsToUnregister)) {
          await api.deleteTeacherAvailability(slotId);
        }
      }

      // Then, handle new registrations
      if (selectedDays.length > 0 && totalSlots > 0) {
        onSubmit(daySchedules);
      }

      handleDialogClose();
      // Optionally reload the page or refresh data
      window.location.reload();
    } catch (error) {
      console.error('Error processing changes:', error);
      alert('Failed to process some changes. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper functions for the UI
  const getSelectedDays = () => Object.keys(daySchedules);
  const getTotalSlots = () => getSelectedDays().reduce((total, day) => total + daySchedules[day].length, 0);
  const isDaySelected = (dayValue: string) => dayValue in daySchedules;
  const isTimeSlotSelected = (dayValue: string, timeSlotValue: string) => 
    daySchedules[dayValue]?.includes(timeSlotValue) || false;
  
  // Check if a slot is already registered
  const isSlotAlreadyRegistered = (dayValue: string, timeSlotValue: string): boolean => {
    return registeredSlots.some(slot => 
      slot.teachDay.toLowerCase() === dayValue.toLowerCase() && 
      slot.timeSlotID === timeSlotValue
    );
  };

  // Get count of registered slots for a day
  const getRegisteredSlotsCount = (dayValue: string): number => {
    return registeredSlots.filter(slot => 
      slot.teachDay.toLowerCase() === dayValue.toLowerCase()
    ).length;
  };

  // Get count of slots marked for removal for a day
  const getRemovalCount = (dayValue: string): number => {
    return registeredSlots.filter(slot => 
      slot.teachDay.toLowerCase() === dayValue.toLowerCase() &&
      slotsToUnregister.has(slot.id)
    ).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Manage Teaching Availability</DialogTitle>
          <DialogDescription>
            {canMakeChanges ? (
              <span className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Changes can only be made until the 10th of each month.
              </span>
            ) : (
              <span className="mt-2 text-sm text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Registration period has ended. No changes can be made after the 10th of the month.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogBody>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Select Days and Time Slots
                </label>
                <p className="text-sm text-neutral-500 mb-4">
                  Click on a day to select it, then choose specific time slots for that day. Already registered slots are marked with a checkmark.
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
                          <span className="text-xs bg-blue-200 text-primary-700 px-2 py-1 rounded-full">
                            {daySchedules[day.value].length} new slot{daySchedules[day.value].length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {getRegisteredSlotsCount(day.value) > 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            ✓ {getRegisteredSlotsCount(day.value)} registered
                          </span>
                        )}
                        {getRemovalCount(day.value) > 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            -{getRemovalCount(day.value)} to remove
                          </span>
                        )}
                      </label>
                    </div>
                    
                    {/* Time Slots for this day */}
                    {(isDaySelected(day.value) || getRegisteredSlotsCount(day.value) > 0) && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {timeSlotOptions.map((timeSlot) => {
                            const isRegistered = isSlotAlreadyRegistered(day.value, timeSlot.value);
                            const registeredSlot = registeredSlots.find(
                              slot => slot.teachDay.toLowerCase() === day.value.toLowerCase() && slot.timeSlotID === timeSlot.value
                            );
                            const isMarkedForDeletion = registeredSlot && slotsToUnregister.has(registeredSlot.id);
                            
                            return (
                              <div
                                key={`${day.value}-${timeSlot.value}`}
                                className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                                  isRegistered 
                                    ? isMarkedForDeletion 
                                      ? 'bg-red-50 border border-red-200' 
                                      : 'bg-green-50'
                                    : 'hover:bg-accent-100'
                                }`}
                              >
                                <label className="flex items-center space-x-3 flex-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isTimeSlotSelected(day.value, timeSlot.value) || (isRegistered && !isMarkedForDeletion)}
                                    onChange={() => !isRegistered && canMakeChanges && handleTimeSlotToggle(day.value, timeSlot.value)}
                                    disabled={isRegistered || !canMakeChanges}
                                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 disabled:opacity-50"
                                  />
                                  <span className={`text-sm flex-1 ${
                                    isMarkedForDeletion 
                                      ? 'text-red-700 line-through' 
                                      : isRegistered 
                                        ? 'text-green-700' 
                                        : 'text-neutral-700'
                                  }`}>
                                    {timeSlot.label}
                                    {isRegistered && !isMarkedForDeletion && (
                                      <span className="ml-2 text-xs text-green-600 font-medium">✓ Registered</span>
                                    )}
                                    {isMarkedForDeletion && (
                                      <span className="ml-2 text-xs text-red-600 font-medium">To be removed</span>
                                    )}
                                  </span>
                                </label>
                                {isRegistered && registeredSlot && canMakeChanges && (
                                  <button
                                    onClick={() => handleToggleUnregister(registeredSlot.id)}
                                    className={`p-1.5 rounded transition-colors ${
                                      isMarkedForDeletion
                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                    }`}
                                    title={isMarkedForDeletion ? "Cancel removal" : "Remove this slot"}
                                  >
                                    {isMarkedForDeletion ? (
                                      <span className="text-xs font-bold">↶</span>
                                    ) : (
                                      <Trash2 className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </div>

              {/* Selection Summary */}
              {(getTotalSlots() > 0 || slotsToUnregister.size > 0) && (
                <div className={`p-4 rounded-lg border ${
                  slotsToUnregister.size > 0 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    slotsToUnregister.size > 0 ? 'text-amber-900' : 'text-green-900'
                  }`}>
                    Changes Summary
                  </h4>
                  <div className="text-sm space-y-2">
                    {getTotalSlots() > 0 && (
                      <div className="text-green-700">
                        <p><strong>New Registrations:</strong> {getTotalSlots()} slot{getTotalSlots() !== 1 ? 's' : ''}</p>
                        <div className="mt-1 space-y-1">
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
                    )}
                    {slotsToUnregister.size > 0 && (
                      <div className="text-red-700 mt-3">
                        <p><strong>To Be Removed:</strong> {slotsToUnregister.size} slot{slotsToUnregister.size !== 1 ? 's' : ''}</p>
                        <div className="mt-1 space-y-1 text-xs">
                          {Array.from(slotsToUnregister).map(slotId => {
                            const slot = registeredSlots.find(s => s.id === slotId);
                            if (!slot) return null;
                            const timeSlot = timeSlots.find(ts => ts.id === slot.timeSlotID);
                            return (
                              <div key={slotId}>
                                <strong>{slot.teachDay}:</strong> {timeSlot?.name || 'Unknown slot'}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={handleDialogClose}
            disabled={loading || isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitRegistration}
            disabled={
              (getTotalSlots() === 0 && slotsToUnregister.size === 0) || 
              loading || 
              isDeleting || 
              !canMakeChanges
            }
            className={slotsToUnregister.size > 0 ? "hover:!bg-amber-500" : "hover:!bg-green-500"}
          >
            {isDeleting ? (
              "Processing..."
            ) : (
              <>
                {getTotalSlots() > 0 && slotsToUnregister.size > 0 
                  ? `Update (${getTotalSlots()} new, ${slotsToUnregister.size} remove)`
                  : getTotalSlots() > 0
                    ? `Register (${getTotalSlots()} slot${getTotalSlots() !== 1 ? 's' : ''})`
                    : `Remove (${slotsToUnregister.size} slot${slotsToUnregister.size !== 1 ? 's' : ''})`
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
