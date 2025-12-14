import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/input";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { updateAssignment } from "@/api/assignments.api";
import { X, Image as ImageIcon, FileText } from "lucide-react";

type UploadedAttachment = {
  name: string;
  size: number;
  type: string;
  url?: string;
  id?: string;
};

type AssignmentPayload = {
  title: string;
  instructions: string;
  dueDate: string;
  files: File[];
  attachments?: UploadedAttachment[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (assignmentData: AssignmentPayload) => void;
  assignmentId: string;
  initialData: {
    title: string;
    description: string | null;
    dueDate: string;
    storeUrl: string | null;
  };

  accept?: string;
  maxFiles?: number;
  maxTotalMB?: number;
};

export default function EditAssignmentPopup({
  open,
  onOpenChange,
  onSubmit,
  assignmentId,
  initialData,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*",
  maxFiles = 10,
  maxTotalMB = 50,
}: Props) {
  // Toast notifications
  const { toasts, hideToast, success, error: showError } = useToast();
  const [title, setTitle] = useState(initialData.title || "");
  const [instructions, setInstructions] = useState(initialData.description || "");
  const [dueDate, setDueDate] = useState(() => {
    // Convert YYYY-MM-DD to datetime-local format (YYYY-MM-DDTHH:mm)
    if (initialData.dueDate) {
      const date = new Date(initialData.dueDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return "";
  });
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // progress per-file và overall
  const [fileProgress, setFileProgress] = useState<number[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData.title || "");
      setInstructions(initialData.description || "");
      // Convert YYYY-MM-DD to datetime-local format
      if (initialData.dueDate) {
        const date = new Date(initialData.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setDueDate("");
      }
      setFiles([]);
      setError(null);
      setFileProgress([]);
      setOverallProgress(0);
      setUploading(false);
    }
  }, [open, initialData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalBytes = (list: File[]) => list.reduce((sum, f) => sum + f.size, 0);

  const addFiles = useCallback(
    (newFilesLike: FileList | File[]) => {
      setError(null);
      const incoming = Array.from(newFilesLike);

      // gộp & loại trùng (name+size+lastModified)
      const existingKey = (f: File) => `${f.name}_${f.size}_${f.lastModified}`;
      const map = new Map<string, File>(files.map((f) => [existingKey(f), f]));
      for (const f of incoming) map.set(existingKey(f), f);
      const merged = Array.from(map.values());

      // kiểm tra số lượng
      if (merged.length > maxFiles) {
        setError(`Bạn chỉ được chọn tối đa ${maxFiles} tệp.`);
        return;
      }

      // kiểm tra tổng dung lượng
      const totalMB = getTotalBytes(merged) / (1024 * 1024);
      if (totalMB > maxTotalMB) {
        setError(
          `Tổng dung lượng vượt ${maxTotalMB} MB (hiện tại ${totalMB.toFixed(2)} MB).`
        );
        return;
      }

      setFiles(merged);
      setFileProgress(new Array(merged.length).fill(0));
      setOverallProgress(0);
    },
    [files, maxFiles, maxTotalMB]
  );

  const handleInputFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  // Drag & Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (idx: number) => {
    const copy = [...files];
    copy.splice(idx, 1);
    setFiles(copy);

    const prog = [...fileProgress];
    prog.splice(idx, 1);
    setFileProgress(prog);

    // update overall
    const sum = prog.reduce((a, b) => a + b, 0);
    setOverallProgress(prog.length ? Math.round(sum / prog.length) : 0);
  };

  const isImage = (file: File) => file.type.startsWith("image/");
  const previews = useMemo(
    () =>
      files.map((f) => (isImage(f) ? URL.createObjectURL(f) : undefined)),
    [files]
  );

  // cleanup object URLs
  useEffect(() => {
    return () => {
      previews.forEach((src) => src && URL.revokeObjectURL(src));
    };
  }, [previews]);

  const uploadToR2 = async (file: File, uploadUrl: string, onProgress: (percent: number) => void): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });
      
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const handleSubmit = async () => {
    if (!title || !dueDate) {
      setError("Vui lòng nhập tiêu đề và hạn nộp.");
      return;
    }

    if (!assignmentId) {
      setError("Assignment ID is missing.");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Prepare update data
      const assignmentData: {
        id: string;
        title: string;
        description: string;
        dueAt: string;
        storeUrl?: string;
        contentType?: string;
        fileName?: string;
      } = {
        id: assignmentId,
        title,
        description: instructions,
        dueAt: new Date(dueDate).toISOString(),
      };

      // If new file is uploaded, include file info and upload to R2
      if (files.length > 0) {
        const file = files[0]; // Take first file
        const contentType = file.type || 'application/octet-stream';
        
        assignmentData.contentType = contentType;
        assignmentData.fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        
        // Step 1: Call update API to get upload URL (similar to create)
        const response = await updateAssignment(assignmentId, assignmentData);
        
        // Step 2: Upload file to R2 if uploadUrl is returned
        if (response.data?.uploadUrl) {
          await uploadToR2(file, response.data.uploadUrl, (percent) => {
            setFileProgress([percent]);
            setOverallProgress(percent);
          });
        }
      } else {
        // If no new file is uploaded, keep existing file (don't send null, keep storeUrl if exists)
        // Don't include contentType and fileName to avoid changing file metadata
        if (initialData.storeUrl) {
          assignmentData.storeUrl = initialData.storeUrl;
        }
        // If storeUrl is null and no new file, we don't send storeUrl field (backend should keep existing)
        
        // Call update API without file upload
        await updateAssignment(assignmentId, assignmentData);
      }

      success("Assignment updated successfully!");
      onSubmit({ title, instructions, dueDate, files });
      onOpenChange(false);
    } catch (e: any) {
      console.error('Error updating assignment:', e);
      showError(e?.response?.data?.message || e?.message || "Failed to update assignment. Please try again.");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4 pt-4">
          <Input
            label="Assignment Title"
            placeholder="e.g., Unit 3 Grammar Exercises"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />

          <Input
            label="Due Date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={uploading}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Instructions 
            </label>
            <textarea
              placeholder="Provide detailed instructions for the assignment..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border rounded-md p-2 text-sm min-h-[120px]"
              disabled={uploading}
            />
          </div>

          {/* Upload nhiều file + Preview + Drag-drop */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              Attachments (Optional - leave empty to keep current file)
            </label>

            {initialData.storeUrl && files.length === 0 && (
              <div className="mb-2 p-2 bg-accent-50 rounded-md border border-accent-200">
                <p className="text-xs text-neutral-600">
                  Current file is available. Upload a new file to replace it.
                </p>
              </div>
            )}

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6",
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white",
                uploading ? "opacity-60 pointer-events-none" : "",
              ].join(" ")}
            >
              <p className="text-sm text-neutral-600 text-center">
                Kéo & thả tệp vào đây, hoặc
              </p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50">
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept={accept}
                  onChange={handleInputFiles}
                  disabled={uploading}
                />
                <span>Chọn tệp</span>
              </label>
              <p className="text-xs text-neutral-500 mt-1">
                Tối đa {maxFiles} tệp • Tổng dung lượng ≤ {maxTotalMB}MB
              </p>
            </div>

            {/* Danh sách file + preview + progress */}
            {files.length > 0 && (
              <div className="mt-2 rounded-md border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <span className="text-sm font-medium text-neutral-700">
                    {files.length} file đã chọn • {formatBytes(getTotalBytes(files))}
                  </span>

                  <div className="flex items-center gap-3">
                    {uploading && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-600 w-10 text-right">
                          {overallProgress}%
                        </span>
                        <div className="h-2 w-40 overflow-hidden rounded bg-gray-100">
                          <div
                            className="h-2 bg-blue-600 transition-all"
                            style={{ width: `${overallProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {!uploading && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => {
                          setFiles([]);
                          setFileProgress([]);
                          setOverallProgress(0);
                        }}
                      >
                        Xoá tất cả
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <ul className="max-h-64 overflow-auto divide-y">
                  {files.map((f, idx) => {
                    const preview = previews[idx];
                    const isImg = isImage(f);
                    const p = fileProgress[idx] ?? 0;

                    return (
                      <li
                        key={`${f.name}_${f.size}_${f.lastModified}`}
                        className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-3 py-2"
                      >
                        {/* Thumbnail */}
                        <div className="h-12 w-12 flex items-center justify-center rounded bg-gray-50 overflow-hidden border border-gray-200">
                          {isImg && preview ? (
                            <img
                              src={preview}
                              alt={f.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText className="h-5 w-5 text-neutral-500" />
                          )}
                        </div>

                        {/* Info + per-file progress */}
                        <div className="min-w-0">
                          <p className="truncate text-sm text-neutral-800">{f.name}</p>
                          <p className="text-xs text-neutral-500">{formatBytes(f.size)}</p>

                          {uploading && (
                            <div className="mt-1 h-2 w-full overflow-hidden rounded bg-gray-100">
                              <div
                                className="h-2 bg-blue-600 transition-all"
                                style={{ width: `${p}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Remove */}
                        <div className="pl-3">
                          {!uploading && (
                            <button
                              onClick={() => removeFile(idx)}
                              className="inline-flex items-center justify-center rounded-md border border-gray-200 p-1 hover:bg-gray-50"
                              aria-label="Remove file"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </DialogBody>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Updating..." : "Update Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
          duration={3000}
        />
      ))}
    </Dialog>
  );
}

