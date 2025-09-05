import React, { useState } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import { 
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  BookOpen
} from "lucide-react";

// Material interfaces
interface PublicMaterial {
  id: string;
  title: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  fileType: "pdf" | "doc" | "ppt" | "txt" | "image";
  downloadUrl: string;
  category?: string;
}

// Mock materials data
const mockMaterials: PublicMaterial[] = [
  {
    id: "1",
    title: "English for Beginners",
    fileName: "English for Beginners.pdf",
    uploadDate: "Jan 30, 2025",
    fileSize: "2.5 MB",
    fileType: "pdf",
    downloadUrl: "/materials/english-beginners.pdf",
    category: "English"
  },
  {
    id: "2", 
    title: "English for Beginners",
    fileName: "English for Beginners.pdf",
    uploadDate: "Jan 30, 2025",
    fileSize: "2.5 MB",
    fileType: "pdf",
    downloadUrl: "/materials/english-beginners-2.pdf",
    category: "English"
  },
  {
    id: "3",
    title: "English for Beginners",
    fileName: "English for Beginners.pdf", 
    uploadDate: "Jan 30, 2025",
    fileSize: "2.5 MB",
    fileType: "pdf",
    downloadUrl: "/materials/english-beginners-3.pdf",
    category: "English"
  },
  {
    id: "4",
    title: "Business Communication",
    fileName: "Business Communication.pdf",
    uploadDate: "Jan 28, 2025",
    fileSize: "3.2 MB", 
    fileType: "pdf",
    downloadUrl: "/materials/business-comm.pdf",
    category: "Business"
  },
  {
    id: "5",
    title: "IELTS Practice Test",
    fileName: "IELTS Practice Test.pdf",
    uploadDate: "Jan 25, 2025",
    fileSize: "4.1 MB",
    fileType: "pdf", 
    downloadUrl: "/materials/ielts-practice.pdf",
    category: "IELTS"
  }
];

// Material Card Component
const MaterialCard: React.FC<{
  material: PublicMaterial;
  onDownload: (material: PublicMaterial) => void;
}> = ({ material, onDownload }) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-500" />;
      case "doc":
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "ppt":
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-neutral-500" />;
    }
  };

  return (
    <Card>
      <div className="p-4 hover:bg-neutral-50 transition-colors">
        <div className="flex items-center justify-between">
          {/* File Info */}
          <div className="flex items-center gap-3 flex-1">
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(material.fileType)}
            </div>
            
            {/* File Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-neutral-900 truncate">
                {material.title}
              </h4>
              <p className="text-sm text-neutral-600 truncate">
                {material.fileName}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {material.uploadDate}
                </span>
                <span className="text-xs text-neutral-500">
                  {material.fileSize}
                </span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex-shrink-0 ml-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDownload(material)}
              iconLeft={<Download className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Search and Filter Component
const MaterialsFilters: React.FC<{
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}> = ({ searchTerm, onSearchChange, selectedCategory, onCategoryChange, categories }) => {
  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function Materials() {
  const [materials] = useState<PublicMaterial[]>(mockMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Get unique categories
  const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean))) as string[];

  // Filter materials
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (material: PublicMaterial) => {
    // Simulate download
    console.log("Downloading:", material.fileName);
    // In real app, this would trigger actual download
    const link = document.createElement('a');
    link.href = material.downloadUrl;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <StudentLayout>
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <PageHeader
            title="Public Materials"
            subtitle="Access and download learning materials and resources"
            actions={
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-neutral-600">
                  {filteredMaterials.length} materials
                </span>
              </div>
            }
          />
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <MaterialsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
        </div>

        {/* Materials List */}
        <div className="space-y-3">
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={handleDownload}
              />
            ))
          ) : (
            // Empty State
            <Card>
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No materials found
                </h3>
                <p className="text-neutral-600">
                  {searchTerm || selectedCategory 
                    ? "Try adjusting your search or filter criteria."
                    : "No public materials are available at the moment."
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Statistics Footer */}
        <div className="mt-8">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-neutral-600">
                <div className="flex items-center gap-4">
                  <span>Total Materials: {materials.length}</span>
                  <span>•</span>
                  <span>Filtered: {filteredMaterials.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Public Library</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}