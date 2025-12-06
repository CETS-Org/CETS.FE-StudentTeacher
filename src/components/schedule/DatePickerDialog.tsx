// src/components/schedule/DatePickerDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "@/components/ui/Dialog";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  today: Date;
};

export default function DatePickerDialog({
  open,
  onOpenChange,
  selectedDate,
  onDateSelect,
  today,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-accent-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary-800">Select a Date</DialogTitle>
        </DialogHeader>
        <DialogBody className="pt-4">
          <ShadCalendar
            mode="single"
            selected={selectedDate ?? today}
            onSelect={(d) => {
              if (!d) return;
              onDateSelect(d);
            }}
            initialFocus
            className="rounded-lg border border-accent-200 shadow-sm"
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}


