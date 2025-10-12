// src/components/modals/UploadMaterialsPopup.tsx

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { UploadCloud, File, X, Info, Send } from "lucide-react";

export type FileWithTitle = {
  file: File;
  title: string;
};

// Định nghĩa props theo khuôn mẫu
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (filesWithTitles: FileWithTitle[]) => void;
};

export default function UploadMaterialsPopup({ open, onOpenChange, onUpload }: Props) {
  // State để lưu trữ danh sách các file người dùng đã chọn với title
  const [filesWithTitles, setFilesWithTitles] = useState<FileWithTitle[]>([]);
  // State để theo dõi khi người dùng kéo file vào vùng dropzone
  const [isDragging, setIsDragging] = useState(false);
  // Ref để truy cập input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state khi popup được mở hoặc đóng
  useEffect(() => {
    if (!open) {
      setFilesWithTitles([]);
      setIsDragging(false);
    }
  }, [open]);

  // Xử lý khi người dùng chọn file từ nút "Choose File"
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, "") // Remove extension as default title
      }));
      setFilesWithTitles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Xử lý khi người dùng thả file vào dropzone
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files).map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, "") // Remove extension as default title
      }));
      setFilesWithTitles(prev => [...prev, ...newFiles]);
    }
  };

  // Xử lý sự kiện kéo file
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Xóa một file khỏi danh sách
  const removeFile = (index: number) => {
    setFilesWithTitles(prev => prev.filter((_, i) => i !== index));
  };

  // Update title for a specific file
  const updateTitle = (index: number, newTitle: string) => {
    setFilesWithTitles(prev => prev.map((item, i) => 
      i === index ? { ...item, title: newTitle } : item
    ));
  };

  // Xử lý khi nhấn nút Upload
  const handleUpload = () => {
    if (filesWithTitles.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }
    // Validate that all files have titles
    const emptyTitles = filesWithTitles.filter(f => !f.title.trim());
    if (emptyTitles.length > 0) {
      alert("Please provide a title for all files.");
      return;
    }
    onUpload(filesWithTitles);
    // Có thể thêm logic đóng popup sau khi upload thành công
    // onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Upload Course Materials</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {/* Vùng kéo thả file */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-10 text-center flex flex-col items-center justify-center transition-colors
              ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
          >
            <UploadCloud className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-semibold text-base">Drag & drop your files here</p>
            <p className="text-gray-500 text-sm mb-4">or click to browse from your computer</p>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Hiển thị danh sách file đã chọn với title input */}
          {filesWithTitles.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Selected Files:</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 p-3 rounded-lg bg-gray-50">
                {filesWithTitles.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    {/* File info */}
                    <div className="flex items-center gap-2 mb-2">
                      <File size={16} className="text-gray-500 flex-shrink-0"/>
                      <span className="text-xs text-gray-600 truncate flex-1">{item.file.name}</span>
                      <span className="text-xs text-gray-500">({(item.file.size / 1024).toFixed(1)} KB)</span>
                      <Button variant="ghost" className="h-6 w-6 p-0" onClick={() => removeFile(index)}>
                        <X size={14} />
                      </Button>
                    </div>
                    {/* Title input */}
                    <div className="space-y-1">
                      <label htmlFor={`title-${index}`} className="block text-xs font-medium text-gray-700">
                        Material Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`title-${index}`}
                        type="text"
                        value={item.title}
                        onChange={(e) => updateTitle(index, e.target.value)}
                        placeholder="Enter material title"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        maxLength={255}
                      />
                      <p className="text-xs text-gray-500">
                        {item.title.length}/255 characters
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chú thích về file */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <Info size={16} className="text-gray-400 flex-shrink-0" />
            <span>
              <strong>Allowed file types:</strong> PDF, DOCX, PPT, MP4, MP3, ZIP, RAR (Maximum file size: 50MB)
            </span>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpload} iconLeft={<Send size={16}/>} className="hover:bg-green-600">
            Upload {filesWithTitles.length > 0 ? `(${filesWithTitles.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}