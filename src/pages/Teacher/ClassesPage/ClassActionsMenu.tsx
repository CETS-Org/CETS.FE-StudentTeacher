import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, Edit, Copy, Trash2 } from "lucide-react";

export interface ClassActionsMenuProps {
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  align?: "left" | "right";
  buttonClassName?: string;   
}

const ClassActionsMenu: React.FC<ClassActionsMenuProps> = ({
  onEdit,
  onDuplicate,
  onDelete,
  align = "right",
  buttonClassName = "p-2 hover:bg-neutral-100 rounded-md",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  // Đóng menu khi click ra ngoài / nhấn ESC
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Focus item đầu khi mở
  useEffect(() => {
    if (open) firstItemRef.current?.focus();
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className={buttonClassName}
        onClick={() => setOpen((s) => !s)}
      >
        <MoreVertical className="w-4 h-4 text-neutral-500" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-44 bg-white border rounded-md shadow-md z-20`}
        >
          <button
            ref={firstItemRef}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 w-full hover:bg-neutral-50 text-sm outline-none"
            onClick={() => {
              onEdit?.();
              setOpen(false);
            }}
          >
            <Edit className="w-4 h-4" /> Edit Class
          </button>
          <button
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 w-full hover:bg-neutral-50 text-sm outline-none"
            onClick={() => {
              onDuplicate?.();
              setOpen(false);
            }}
          >
            <Copy className="w-4 h-4" /> Duplicate
          </button>
          <button
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 w-full hover:bg-red-50 text-sm text-red-600 outline-none"
            onClick={() => {
              onDelete?.();
              setOpen(false);
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassActionsMenu;
