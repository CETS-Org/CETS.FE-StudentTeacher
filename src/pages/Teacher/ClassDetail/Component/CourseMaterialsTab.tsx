// src/pages/teacher/classes/[classId]/CourseMaterialsTab.tsx

import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import { FileText, Upload, Edit, Trash2 } from "lucide-react";
import UploadMaterialsPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UploadMaterialsPopup"; 
import UpdateMaterialPopup from "@/pages/Teacher/ClassDetail/Component/Popup/UpdateMaterialPopup";
import Pagination from "@/Shared/Pagination";
import { api } from "@/api";
import type { LearningMaterial } from "@/types/learningMaterial";

export default function CourseMaterialsTab() {
  const { classId } = useParams<{ classId: string }>();
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

  // Load materials when component mounts or classId changes
  useEffect(() => {
    if (classId) {
      loadMaterials();
    }
  }, [classId]);

  const loadMaterials = async () => {
    if (!classId) return;
    
    try {
      setLoading(true);
      const response = await api.getLearningMaterialsByClass(classId);
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
      alert('Failed to load learning materials');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUpload = async (files: File[]) => {
    if (!classId) {
      alert('Class ID is required');
      return;
    }

    setUploading(true);
    
    try {
      for (const file of files) {
        console.log(`Uploading file: ${file.name}`);
        
        // Step 1: Create learning material record and get presigned URL
        const createResponse = await api.createLearningMaterial({
          classID: classId,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension from title
          contentType: file.type,
          fileName: file.name
        });

        const { uploadUrl } = createResponse.data;
        
        // Step 2: Upload file to Cloudflare R2 using presigned URL
        const uploadResponse = await api.uploadToPresignedUrl(uploadUrl, file, file.type);
        
        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name} to storage`);
        }

        console.log(`Successfully uploaded ${file.name} to R2`);
      }

      // Reload materials to show the newly uploaded ones
      await loadMaterials();
      
      alert(`${files.length} file(s) uploaded successfully!`);
      setPopupOpen(false);
      setCurrentPage(1); // Go to first page to see new materials
      
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
      // For now, just update the title in local state
      // You can implement the backend update API later
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
      
      // Remove from local state
      setMaterials(prevMaterials => 
        prevMaterials.filter(material => material.id !== deleteConfirmId)
      );
      
      // Adjust current page if necessary
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
            Get started by uploading some course materials.
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