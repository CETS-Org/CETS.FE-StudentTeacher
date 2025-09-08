import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/Dialog";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { X, Image as ImageIcon, FileText } from "lucide-react";

type UploadedAttachment = {
  name: string;
  size: number;
  type: string;
  url?: string;   // trả về từ server (nếu onUpload cung cấp)
  id?: string;    // id từ server (nếu có)
};

type AssignmentPayload = {
  title: string;
  instructions: string;
  dueDate: string;          // ISO string từ input datetime-local
  files: File[];            // danh sách file thô
  attachments?: UploadedAttachment[]; // metadata sau upload (nếu có onUpload)
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (assignmentData: AssignmentPayload) => void;

  /** (tuỳ chọn) Hàm upload từng file với callback progress.
   *  Trả về url hoặc id tuỳ backend.
   */
  onUpload?: (
    file: File,
    onProgress: (percent: number) => void
  ) => Promise<{ url?: string; id?: string }>;

  accept?: string;     // ví dụ: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
  maxFiles?: number;   // mặc định 10
  maxTotalMB?: number; // tổng dung lượng tối đa (MB), mặc định 50
};

export default function CreateAssignmentPopup({
  open,
  onOpenChange,
  onSubmit,
  onUpload,
  accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*",
  maxFiles = 10,
  maxTotalMB = 50,
}: Props) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // progress per-file và overall
  const [fileProgress, setFileProgress] = useState<number[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setInstructions("");
      setDueDate("");
      setFiles([]);
      setError(null);
      setFileProgress([]);
      setOverallProgress(0);
      setUploading(false);
    }
  }, [open]);

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

  const handleSubmit = async () => {
    if (!title || !dueDate) {
      setError("Vui lòng nhập tiêu đề và hạn nộp.");
      return;
    }

    // Nếu không có onUpload -> behave như trước, chỉ trả về files
    if (!onUpload || files.length === 0) {
      onSubmit({ title, instructions, dueDate, files });
      onOpenChange(false);
      return;
    }

    // Có onUpload -> upload từng file với progress
    try {
      setUploading(true);
      const meta: UploadedAttachment[] = [];
      const perFile = [...fileProgress];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];

        // callback cập nhật progress từng file
        const update = (p: number) => {
          perFile[i] = Math.max(0, Math.min(100, Math.round(p)));
          setFileProgress([...perFile]);
          const sum = perFile.reduce((a, b) => a + b, 0);
          setOverallProgress(Math.round(sum / perFile.length));
        };

        const result = await onUpload(f, update);
        meta.push({
          name: f.name,
          size: f.size,
          type: f.type,
          url: result?.url,
          id: result?.id,
        });
      }

      onSubmit({ title, instructions, dueDate, files, attachments: meta });
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.message || "Upload thất bại. Vui lòng thử lại.");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create Assignment</DialogTitle>
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
              Attachments 
            </label>

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
            {uploading ? "Uploading..." : "Create Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
