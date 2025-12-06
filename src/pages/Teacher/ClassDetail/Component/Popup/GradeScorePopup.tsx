// src/components/modals/GradeScorePopup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (score: number, submissionId: string) => void;
  initialScore?: string; // Điểm số ban đầu (nếu có, cho trường hợp chỉnh sửa)
  submissionId?: string; // ID của submission
};

export default function GradeScorePopup({ open, onOpenChange, onSubmit, initialScore = "", submissionId = "" }: Props) {
  const [score, setScore] = useState(initialScore);
  const [error, setError] = useState("");

  // Cập nhật điểm số khi props initialScore thay đổi
  useEffect(() => {
    setScore(initialScore);
    setError("");
  }, [initialScore, open]);

  const handleSubmit = () => {
    if (!score) {
      setError("Please enter a score.");
      return;
    }
    if (!submissionId) {
      setError("Submission ID is missing.");
      return;
    }
    
    // Validate score is a number
    const scoreNumber = parseFloat(score);
    if (isNaN(scoreNumber)) {
      setError("Please enter a valid number.");
      return;
    }
    
    onSubmit(scoreNumber, submissionId);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm"> {/* Kích thước nhỏ */}
        <DialogHeader>
          <DialogTitle>Grade student score</DialogTitle>
        </DialogHeader>
        <DialogBody className="pt-4">
          <Input
            placeholder="0/100"
            value={score}
            onChange={(e) => {
              setScore(e.target.value);
              if (error) setError("");
            }}
            className={error ? 'border-red-500 focus:ring-red-500' : ''}
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