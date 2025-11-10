import React, { useState } from "react";
import Button from "@/components/ui/Button";
import WeeklyFeedbackModal from "@/pages/Teacher/ClassDetail/Component/WeeklyFeedbackModal";

type Props = {
  classId: string;
  classMeetingId: string;
  weekNumber: number;

};

const WeeklyFeedbackButton: React.FC<Props> = ({ classId, classMeetingId, weekNumber }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" className="border-accent-300 text-accent-700 hover:bg-accent-50" onClick={() => setOpen(true)}>
        Weekly Feedback
      </Button>

      <WeeklyFeedbackModal
        classId={classId}
        classMeetingId={classMeetingId}
        weekNumber={weekNumber}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default WeeklyFeedbackButton;
