import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils"; // đổi đường dẫn nếu utils của bạn nằm nơi khác

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
  month: "space-y-4",
  caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-sm font-medium",
  nav: "space-x-1 flex items-center",
  nav_button:
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
  table: "w-full border-collapse space-y-1",
  head_row: "flex",
  head_cell: "text-sky-700 rounded-md w-9 font-normal text-[0.8rem]",
  row: "flex w-full mt-2",
  cell:
    "text-center text-sm p-0 relative " +
    "[&:has([aria-selected].day-outside)]:bg-sky-50/50 " +
    "[&:has([aria-selected])]:bg-sky-100 " +
    "focus-within:relative focus-within:z-20",
  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-center " +
       "hover:bg-sky-100 hover:text-sky-900 rounded-md cursor-pointer transition-colors",
  day_selected:
    "bg-sky-600 text-white hover:bg-sky-600 hover:text-white " +
    "focus:bg-sky-600 focus:text-white",
  day_today: "bg-sky-100 text-sky-900",
  day_outside: "day-outside text-sky-400 opacity-50",
  day_disabled: "text-sky-300 opacity-50",
  day_range_middle: "aria-selected:bg-sky-200 aria-selected:text-sky-900",
  day_hidden: "invisible",
}}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
export { Calendar };
