import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import { FileText, Upload, Edit, Trash2 } from "lucide-react";
import UploadMaterialsPopup, { type FileWithTitle } from "@/pages/Teacher/ClassDetail/Component/Popup/UploadMaterialsPopup"; 
import UpdateMaterialPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UpdateMaterialPopup";
import Pagination from "@/Shared/Pagination";
import { api } from "@/api";
import type { LearningMaterial } from "@/types/learningMaterial";

export default function CourseMaterialsTab() {
  // Normalize route params across teacher and student routes
  const { id, sessionId, classId: classIdParam, classMeetingId: classMeetingIdParam } = useParams<{
    id?: string;
    sessionId?: string;
    classId?: string;
    classMeetingId?: string;
  }>();

  const classId = classIdParam || id;
  const classMeetingId = classMeetingIdParam || sessionId;
  const [resolvedMeetingId, setResolvedMeetingId] = useState<string | undefined>(classMeetingId);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setUpdatePopupOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(materials.length / itemsPerPage);

  // Get materials for current page
  const currentMaterials = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return materials.slice(startIndex, endIndex);
  }, [currentPage, materials]);

  // Keep resolvedMeetingId in sync with route param; if it's missing, attempt to resolve from classId
  useEffect(() => {
    let cancelled = false;
    const syncMeeting = async () => {
      if (classMeetingId) {
        setResolvedMeetingId(classMeetingId);
        return;
      }
      if (!classId) {
        setResolvedMeetingId(undefined);
        return;
      }
      try {
        // Fallback: pick the earliest upcoming or first meeting
        const list = await api.getClassMeetingsByClassId(classId);
        if (cancelled) return;
        if (list.length > 0) {
          const first = list[0];
          setResolvedMeetingId(first.id || (first as any).meetingID);
        } else {
          setResolvedMeetingId(undefined);
        }
      } catch {
        if (!cancelled) setResolvedMeetingId(undefined);
      }
    };
    syncMeeting();
    return () => {
      cancelled = true;
    };
  }, [classId, classMeetingId]);

  // Load materials whenever the resolved meeting changes
  useEffect(() => {
    const load = async () => {
      if (!resolvedMeetingId) {
        setMaterials([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.getLearningMaterialsByClassMeeting(resolvedMeetingId);
        setMaterials(response.data || []);
      } catch (error) {
        console.error('Error loading materials:', error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resolvedMeetingId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpload = async (filesWithTitles: FileWithTitle[]) => {
    if (!resolvedMeetingId) {
      alert('Please select a session before uploading materials.');
      return;
    }

    setUploading(true);
    try {
      let successCount = 0;
      let failCount = 0;
      for (const { file, title } of filesWithTitles) {
        // Ensure we have a valid content type; fallback to octet-stream if empty
        const contentType = file.type || 'application/octet-stream';
        
        // Step 1: request creation + presigned URL
        const createResponse = await api.createLearningMaterial({
          classMeetingID: resolvedMeetingId,
          title: title.trim(), // Use custom title from user input
          contentType: contentType,
          fileName: file.name
        });

        const createdId = createResponse.data?.id || createResponse.data?.Id;
        const { uploadUrl } = createResponse.data;

        // Step 2: upload to storage using the EXACT same contentType
        const uploadResponse = await api.uploadToPresignedUrl(uploadUrl, file, contentType);
        if (!uploadResponse.ok) {
          // Roll back DB record if storage upload failed
          if (createdId) {
            try { await api.deleteLearningMaterial(createdId); } catch {}
          }
          failCount++;
          continue;
        }
        successCount++;
      }
      // Reload
      const response = await api.getLearningMaterialsByClassMeeting(resolvedMeetingId);
      setMaterials(response.data || []);
      if (failCount === 0) {
        alert(`${successCount} file(s) uploaded successfully!`);
      } else if (successCount === 0) {
        alert(`Upload failed for ${failCount} file(s). No materials were saved.`);
      } else {
        alert(`Uploaded ${successCount} file(s). ${failCount} failed and were rolled back.`);
      }
      setPopupOpen(false);
      setCurrentPage(1);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateMaterial = (material: LearningMaterial) => {
    setSelectedMaterial(material);
    setUpdatePopupOpen(true);
  };

  const handleUpdateSubmit = async (materialId: number, title: string) => {
    try {
      setMaterials(prevMaterials => 
        prevMaterials.map(material => 
          material.id === materialId.toString() ? { ...material, title } : material
        )
      );
      alert('Material updated successfully!');
      setUpdatePopupOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update material');
    }
  };

  const handleDeleteMaterial = (materialId: string) => {
    setDeleteConfirmId(materialId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await api.deleteLearningMaterial(deleteConfirmId);
      setMaterials(prevMaterials => 
        prevMaterials.filter(material => material.id !== deleteConfirmId)
      );
      const newTotalPages = Math.ceil((materials.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      alert('Material deleted successfully!');
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete material');
      setDeleteConfirmId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading materials...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Course Materials</h2>
        <Button
          onClick={() => setPopupOpen(true)}
          iconLeft={<Upload size={16} />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Materials'}
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No materials yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {resolvedMeetingId ? 'Get started by uploading some session materials.' : 'Please select a session to view or upload materials.'}
          </p>
          <div className="mt-6">
            <Button onClick={() => setPopupOpen(true)} iconLeft={<Upload size={16} />}>
              Upload Materials
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {currentMaterials.map((material) => (
                <li key={material.id}>
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <FileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <div className="ml-4 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {material.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Uploaded on {formatDate(material.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateMaterial(material)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={materials.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      <UploadMaterialsPopup
        open={isPopupOpen}
        onOpenChange={setPopupOpen}
        onUpload={handleUpload}
      />

      {selectedMaterial && (
        <UpdateMaterialPopup
          open={isUpdatePopupOpen}
          onOpenChange={setUpdatePopupOpen}
          material={{
            id: parseInt(selectedMaterial.id),
            name: selectedMaterial.title,
            date: formatDate(selectedMaterial.createdAt)
          }}
          onUpdate={handleUpdateSubmit}
        />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this learning material? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}