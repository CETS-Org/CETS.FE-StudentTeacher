// src/components/modals/FeedbackPopup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string) => void;
  initialFeedback?: string; // Góp ý ban đầu (nếu có)
};

export default function FeedbackPopup({ open, onOpenChange, onSubmit, initialFeedback = "" }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback);

  // Cập nhật feedback khi props thay đổi
  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback, open]);

  const handleSubmit = () => {
    if (!feedback.trim()) {
      alert("Please provide some feedback.");
      return;
    }
    onSubmit(feedback);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md"> {/* Kích thước vừa phải */}
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <DialogBody className="pt-4">
          <textarea
            placeholder="Value"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full border rounded-md p-2 text-sm min-h-[120px]"
          />
        </DialogBody>
        <DialogFooter className="mt-4">
          {/* Các nút bấm tiếng Việt theo hình ảnh */}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}