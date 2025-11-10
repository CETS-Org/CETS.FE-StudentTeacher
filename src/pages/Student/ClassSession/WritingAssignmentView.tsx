import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Send,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  FileText,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import jsPDF from "jspdf";

const CDN_BASE_URL = "https://pub-59cfd11e5f0d4b00af54839edc83842d.r2.dev";

interface WritingAssignmentViewProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    attachmentUrl?: string;
  };
  existingContent?: string;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

type ExportFormat = "pdf";

export default function WritingAssignmentView({
  assignment,
  existingContent = "",
  onClose,
  onSubmit,
}: WritingAssignmentViewProps) {
  const { toasts, hideToast, success, error: showError } = useToast();
  
  const [content, setContent] = useState(existingContent);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [documentError, setDocumentError] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate word count (strip HTML tags)
  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Auto-save functionality (save to localStorage)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (content.trim()) {
        localStorage.setItem(`writing-draft-${assignment.id}`, content);
        setLastSaved(new Date());
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, assignment.id]);

  // Load draft from localStorage on mount and set to editor
  useEffect(() => {
    if (!existingContent) {
      const draft = localStorage.getItem(`writing-draft-${assignment.id}`);
      if (draft) {
        setContent(draft);
        // Set content to editor if it exists
        if (editorRef.current) {
          editorRef.current.innerHTML = draft;
        }
        success("Draft loaded from auto-save");
      }
    } else if (existingContent && editorRef.current) {
      // Set existing content to editor
      editorRef.current.innerHTML = existingContent;
    }
  }, [assignment.id, existingContent]);

  // Initialize editor content on mount
  useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const getFullFileUrl = (fileUrl: string): string => {
    if (!fileUrl) return "";
    // Ensure proper URL formatting (add / if needed)
    const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${CDN_BASE_URL}${normalizedUrl}`;
  };

  const getDocumentViewerUrl = (fileUrl: string): string => {
    const fullUrl = getFullFileUrl(fileUrl);
    
    // Check if URL has proper extension
    const hasExtension = fileUrl.includes('.') && fileUrl.lastIndexOf('.') > fileUrl.lastIndexOf('/');
    const fileExtension = hasExtension ? fileUrl.split('.').pop()?.toLowerCase() : null;

    console.log('Getting viewer URL:', {
      fileUrl,
      fullUrl,
      hasExtension,
      fileExtension
    });

    // For PDF files, use direct iframe
    if (fileExtension === 'pdf') {
      console.log('Using direct PDF viewer');
      return fullUrl;
    }

    // For DOCX and other Office files, use Microsoft Office Online Viewer
    if (fileExtension === 'docx' || fileExtension === 'doc' || fileExtension === 'xlsx' || fileExtension === 'pptx') {
      console.log('Using Office Online Viewer for Office files');
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    }

    // If no extension detected:
    // - For submissions (student uploaded files), use Google Docs Viewer (supports both PDF and DOC/DOCX)
    // - For assignments (teacher uploaded), use Office viewer as they're likely Word docs
    if (!fileExtension) {
      if (fileUrl.includes('submissions/')) {
        console.log('No extension but is submission - using Google Docs Viewer (supports PDF and DOC)');
        // Submissions can be PDF (from text editor) or DOC/DOCX (from file upload)
        // Google Docs Viewer supports both formats
        return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      } else if (fileUrl.includes('assignments/')) {
        console.log('No extension but is assignment - using Office Online Viewer');
        // Assignments are likely Word docs from teacher
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
      }
    }

    // For other files, use Google Docs Viewer as fallback
    console.log('Using Google Docs Viewer as fallback');
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  const handleManualSave = () => {
    if (!content.trim()) {
      showError("Cannot save empty content");
      return;
    }

    setIsSaving(true);
    localStorage.setItem(`writing-draft-${assignment.id}`, content);
    setLastSaved(new Date());
    
    setTimeout(() => {
      setIsSaving(false);
      success("Draft saved successfully");
    }, 500);
  };

  const createFile = async (): Promise<File> => {
    // Create safe filename following teacher's standard
    const timestamp = new Date().getTime();
    const safeTitle = assignment.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50); // Limit length
    const fileName = `${safeTitle}_Submission_${timestamp}.pdf`;
    
    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 7;
    let yPosition = margin;

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(assignment.title, margin, yPosition);
    yPosition += lineHeight * 2;

    // Add metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Due Date: ${new Date(assignment.dueDate).toLocaleDateString()}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Word Count: ${wordCount}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Add content (convert HTML to plain text)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(textContent, maxWidth);
    
    for (const line of lines) {
      if (yPosition + lineHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    }

    const pdfBlob = doc.output("blob");
    return new File([pdfBlob], fileName, {
      type: "application/pdf",
    });
  };

  const handleDownload = async () => {
    if (!content.trim()) {
      showError("Cannot download empty content");
      return;
    }

    try {
      const file = await createFile();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success("Downloaded as PDF");
    } catch (error) {
      console.error("Download error:", error);
      showError("Failed to download file");
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showError("Please write your answer before submitting");
      return;
    }

    if (wordCount < 10) {
      showError("Your answer seems too short. Please write at least 10 words.");
      return;
    }

    try {
      setIsSubmitting(true);
      const file = await createFile();
      
      console.log('Created file for submission:', {
        name: file.name,
        type: file.type,
        size: file.size,
        format: 'pdf'
      });
      
      const result = await onSubmit(file);
      
      console.log('Submit result:', result);
      
      // Clear draft after successful submission
      localStorage.removeItem(`writing-draft-${assignment.id}`);
      success("Assignment submitted successfully!");
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Submit error:", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to submit assignment";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      }
      
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyFormatting = (command: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Focus editor first
    editor.focus();

    // Apply formatting using execCommand
    document.execCommand(command, false);
    
    // Update content from editor
    const htmlContent = editor.innerHTML;
    setContent(htmlContent);
  };

  // Document loading timeout
  useEffect(() => {
    if (assignment.attachmentUrl) {
      console.log('Loading assignment file:', {
        fileUrl: assignment.attachmentUrl,
        fullUrl: getFullFileUrl(assignment.attachmentUrl),
        viewerUrl: getDocumentViewerUrl(assignment.attachmentUrl)
      });
      
      setDocumentLoading(true);
      setDocumentError(false);
      
      // Fallback timeout: hide loading after 10 seconds if iframe doesn't trigger onLoad
      const loadingTimeout = setTimeout(() => {
        console.log('Document loading timeout - hiding spinner');
        setDocumentLoading(false);
      }, 10000);
      
      return () => clearTimeout(loadingTimeout);
    }
  }, [assignment.attachmentUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [content, handleManualSave]);

  const renderDocumentViewer = () => {
    if (!assignment.attachmentUrl) {
      return (
        <div className="h-full flex items-center justify-center bg-neutral-50">
          <div className="text-center text-neutral-500">
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No assignment file attached</p>
          </div>
        </div>
      );
    }

    if (documentError) {
      return (
        <div className="h-full flex items-center justify-center bg-neutral-50">
          <div className="text-center text-neutral-600 px-4">
            <AlertCircle size={48} className="mx-auto mb-3 text-red-500" />
            <p className="text-sm mb-3">Failed to load document</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDocumentError(false);
                setDocumentLoading(true);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-full">
        {documentLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 size={40} className="animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-sm text-neutral-600">Loading assignment...</p>
            </div>
          </div>
        )}
        <iframe
          key={assignment.attachmentUrl}
          src={getDocumentViewerUrl(assignment.attachmentUrl)}
          className="w-full h-full border-none"
          onLoad={() => {
            console.log('Document loaded successfully');
            setDocumentLoading(false);
          }}
          onError={() => {
            console.error('Document failed to load');
            setDocumentLoading(false);
            setDocumentError(true);
          }}
          title="Assignment Document"
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col">
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

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">{assignment.title}</h1>
              <p className="text-sm text-primary-100">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-primary-100">
                Auto-saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving || !content.trim()}
              iconLeft={isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              className="!bg-white/10 hover:!bg-white/20 !text-white border border-white/30 disabled:!opacity-50"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
              iconLeft={isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              className="!bg-white !text-primary-600 hover:!bg-primary-50 border border-primary-200 disabled:!opacity-50 disabled:!bg-neutral-100"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Assignment File Viewer */}
        <div className="w-1/2 border-r border-neutral-200 flex flex-col">
          <div className="bg-neutral-100 px-4 py-3 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <FileText size={16} />
                Assignment Instructions
              </h2>
              {assignment.attachmentUrl && (
                <a
                  href={getFullFileUrl(assignment.attachmentUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Download size={14} />
                  Download
                </a>
              )}
            </div>
            {assignment.description && (
              <p className="text-xs text-neutral-600 mt-2">{assignment.description}</p>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            {renderDocumentViewer()}
          </div>
        </div>

        {/* Right Column - Text Editor */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Toolbar */}
          <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <Type size={16} />
                Your Answer
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                </span>
                <span className="text-neutral-300">|</span>
                <span className="text-xs text-neutral-600">Format: PDF</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!content.trim()}
                  iconLeft={<Download size={14} />}
                  className="text-xs"
                >
                  Download PDF
                </Button>
              </div>
            </div>
            
            {/* Formatting Buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => applyFormatting('bold')}
                className="p-2 hover:bg-neutral-200 rounded transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('italic')}
                className="p-2 hover:bg-neutral-200 rounded transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('underline')}
                className="p-2 hover:bg-neutral-200 rounded transition-colors"
                title="Underline (Ctrl+U)"
              >
                <Underline size={16} />
              </button>
              <div className="w-px h-6 bg-neutral-300 mx-1" />
              <button
                type="button"
                onClick={() => applyFormatting('insertUnorderedList')}
                className="p-2 hover:bg-neutral-200 rounded transition-colors"
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('insertOrderedList')}
                className="p-2 hover:bg-neutral-200 rounded transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
              <div className="w-px h-6 bg-neutral-300 mx-1" />
              <span className="text-xs text-neutral-500 px-2">
                Tip: Use Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline)
              </span>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="flex-1 p-4 overflow-auto">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => {
                const htmlContent = e.currentTarget.innerHTML;
                setContent(htmlContent);
              }}
              onPaste={(e) => {
                // Prevent default paste to avoid unwanted formatting
                e.preventDefault();
                const text = e.clipboardData.getData('text/plain');
                document.execCommand('insertText', false, text);
              }}
              className="w-full h-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-serif text-base leading-relaxed"
              style={{ minHeight: '100%', whiteSpace: 'pre-wrap' }}
              data-placeholder="Start writing your answer here..."
            />
          </div>
          <style>{`
            [contenteditable]:empty:before {
              content: attr(data-placeholder);
              color: #9ca3af;
            }
          `}</style>

          {/* Footer Tips */}
          <div className="bg-neutral-50 border-t border-neutral-200 px-4 py-2">
            <p className="text-xs text-neutral-500">
              💡 <strong>Tips:</strong> Your work is auto-saved every 2 seconds. Press <kbd className="px-1 py-0.5 bg-neutral-200 rounded text-neutral-700">Ctrl+S</kbd> to save manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

