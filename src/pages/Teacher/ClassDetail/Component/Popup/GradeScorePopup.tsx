// src/components/modals/GradeScorePopup.tsx

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Định nghĩa props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (score: string) => void;
  initialScore?: string; // Điểm số ban đầu (nếu có, cho trường hợp chỉnh sửa)
};

export default function GradeScorePopup({ open, onOpenChange, onSubmit, initialScore = "" }: Props) {
  const [score, setScore] = useState(initialScore);

  // Cập nhật điểm số khi props initialScore thay đổi
  useEffect(() => {
    setScore(initialScore);
  }, [initialScore, open]);

  const handleSubmit = () => {
    if (!score) {
      alert("Please enter a score.");
      return;
    }
    // Bạn có thể thêm logic xác thực điểm số ở đây (ví dụ: phải là số từ 0-100)
    onSubmit(score);
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
            onChange={(e) => setScore(e.target.value)}
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