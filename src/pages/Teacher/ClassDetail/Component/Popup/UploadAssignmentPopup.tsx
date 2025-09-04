// src/components/modals/CreateAssignmentPopup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (assignmentData: { title: string; instructions: string; dueDate: string; }) => void;
};

export default function CreateAssignmentPopup({ open, onOpenChange, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Reset form khi popup được mở
  useEffect(() => {
    if (open) {
      setTitle("");
      setInstructions("");
      setDueDate("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!title || !dueDate) {
      alert("Please provide a title and a due date.");
      return;
    }
    onSubmit({ title, instructions, dueDate });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4 pt-4">
          <Input
            label="Assignment Title"
            placeholder="e.g., Unit 3 Grammar Exercises"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
           <Input
            label="Due Date"
            type="datetime-local" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Instructions (Optional)
            </label>
            <textarea
              placeholder="Provide detailed instructions for the assignment..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border rounded-md p-2 text-sm min-h-[120px]"
            />
          </div>
        </DialogBody>
        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Assignment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}