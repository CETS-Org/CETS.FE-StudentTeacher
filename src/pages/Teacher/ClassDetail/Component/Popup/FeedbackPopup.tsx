// src/components/modals/FeedbackPopup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string, submissionId: string) => void;
  initialFeedback?: string; // Góp ý ban đầu (nếu có)
  submissionId?: string; // ID của submission
};

export default function FeedbackPopup({ open, onOpenChange, onSubmit, initialFeedback = "", submissionId = "" }: Props) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [error, setError] = useState("");

  // Cập nhật feedback khi props thay đổi
  useEffect(() => {
    setFeedback(initialFeedback);
    setError("");
  }, [initialFeedback, open]);

  const handleSubmit = () => {
    if (!feedback.trim()) {
      setError("Please provide some feedback.");
      return;
    }
    if (!submissionId) {
      setError("Submission ID is missing.");
      return;
    }
    onSubmit(feedback, submissionId);
    setError("");
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
            placeholder="Enter your feedback..."
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              if (error) setError("");
            }}
            className={`w-full border rounded-md p-2 text-sm min-h-[120px] focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 focus:ring-accent-500'
            }`}
          />
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
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