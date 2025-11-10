import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  message: string;
};

export default function DeleteConfirmDialog({ open, onOpenChange, onConfirm, title, message }: Props) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-neutral-700">{message}</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">Yes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

