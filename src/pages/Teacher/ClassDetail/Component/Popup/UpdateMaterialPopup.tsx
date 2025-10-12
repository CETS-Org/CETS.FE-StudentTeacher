// src/components/modals/UpdateMaterialPopup.tsx

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { UploadCloud, File, X, Info, Save, Eye } from "lucide-react";
import { config } from "@/lib/config";

// Define the material type
type Material = {
  id: string;
  name: string;
  fileName?: string;
  storeUrl?: string;
  date: string;
};

// Define props
type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (materialId: string, title: string, file?: File) => void;
  material: Material | null;
};

export default function UpdateMaterialPopup({ open, onOpenChange, onUpdate, material }: Props) {
  // State for title input
  const [title, setTitle] = useState("");
  // State for optional file replacement
  const [file, setFile] = useState<File | null>(null);
  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false);
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when popup opens/closes or material changes
  useEffect(() => {
    if (open && material) {
      setTitle(material.name.replace(/\.[^/.]+$/, "")); // Remove file extension
      setFile(null);
      setIsDragging(false);
    } else if (!open) {
      setTitle("");
      setFile(null);
      setIsDragging(false);
    }
  }, [open, material]);

  // Handle file selection from button
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  
  // Handle file drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  // Handle drag events
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
  };

  // Handle update submission
  const handleUpdate = () => {
    if (!material || !title.trim()) {
      alert("Please enter a title for the material.");
      return;
    }
    
    onUpdate(material.id, title.trim(), file || undefined);
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Handle view file
  const handleViewFile = () => {
    if (material?.storeUrl) {
      const fullUrl = material.storeUrl.startsWith('http') 
        ? material.storeUrl 
        : `${config.storagePublicUrl}${material.storeUrl.startsWith('/') ? material.storeUrl : '/' + material.storeUrl}`;
      
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('File URL is not available.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Update Course Material</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="material-title" className="block text-sm font-medium text-gray-700">
              Material Title <span className="text-red-500">*</span>
            </label>
            <input
              id="material-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={255}
            />
            <p className="text-xs text-gray-500">
              {title.length}/255 characters
            </p>
          </div>

          {/* Optional File Replacement */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Replace File (Optional)
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center transition-colors
                ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
            >
              <UploadCloud className="text-gray-400 mb-2" size={32} />
              <p className="text-gray-600 font-medium text-sm">Drag & drop a new file here</p>
              <p className="text-gray-500 text-xs mb-3">or click to browse from your computer</p>
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                Choose New File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Show selected file */}
          {file && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-gray-700">New File Selected:</h3>
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-2 text-sm">
                  <File size={16} className="text-gray-500"/>
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={removeFile}>
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* File type info */}
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
            <Info size={16} className="text-gray-400 flex-shrink-0" />
            <span>
              <strong>Allowed file types:</strong> PDF, DOCX, PPT, MP4, MP3, ZIP, RAR (Maximum file size: 50MB)
            </span>
          </div>

          {/* Current file info */}
          {material && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    <strong>Current file:</strong> {material.fileName || material.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    If no new file is selected, only the title will be updated.
                  </p>
                </div>
                {material.storeUrl && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleViewFile}
                    title="View Current File"
                  >
                    <span className="text-xs">View</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} iconLeft={<Save size={16}/>} className="hover:bg-green-600">
            Update Material
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
