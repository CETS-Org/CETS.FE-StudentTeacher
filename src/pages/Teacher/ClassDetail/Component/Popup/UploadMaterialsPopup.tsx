// src/components/modals/UploadMaterialsPopup.tsx

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/button";
import { UploadCloud, File, X, Info, Send } from "lucide-react";

// Định nghĩa props theo khuôn mẫu
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
};

export default function UploadMaterialsPopup({ open, onOpenChange, onUpload }: Props) {
  // State để lưu trữ danh sách các file người dùng đã chọn
  const [files, setFiles] = useState<File[]>([]);
  // State để theo dõi khi người dùng kéo file vào vùng dropzone
  const [isDragging, setIsDragging] = useState(false);
  // Ref để truy cập input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state khi popup được mở hoặc đóng
  useEffect(() => {
    if (!open) {
      setFiles([]);
      setIsDragging(false);
    }
  }, [open]);

  // Xử lý khi người dùng chọn file từ nút "Choose File"
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(prev => [...prev, ...Array.from(event.target.files!)]);
    }
  };
  
  // Xử lý khi người dùng thả file vào dropzone
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(event.dataTransfer.files)]);
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
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Xử lý khi nhấn nút Upload
  const handleUpload = () => {
    if (files.length === 0) {
      alert("Please select at least one file to upload.");
      return;
    }
    onUpload(files);
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

          {/* Hiển thị danh sách file đã chọn */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Selected Files:</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2 text-sm">
                      <File size={16} className="text-gray-500"/>
                      <span className="font-medium">{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                   <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => removeFile(index)}>
                      <X size={16} />
                  </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Chú thích về file */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <Info size={16} className="text-gray-400 flex-shrink-0" />
            <span>
              <strong>Allowed file types:</strong> PDF, DOCX, PPT, MP4, MP3 (Maximum file size: 50MB)
            </span>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpload} iconLeft={<Send size={16}/>}>
            Upload {files.length > 0 ? `(${files.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}