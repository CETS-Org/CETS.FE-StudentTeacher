import React, { useState } from "react";
import StudentLayout from "@/Shared/StudentLayout";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
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
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
        );
      case "doc":
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
        );
      case "ppt":
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-lg flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
        );
    }
  };

  const getCategoryBadge = (category: string | undefined) => {
    const categoryColors: Record<string, string> = {
      "English": "bg-gradient-to-r from-blue-500 to-blue-600",
      "Business": "bg-gradient-to-r from-purple-500 to-purple-600", 
      "IELTS": "bg-gradient-to-r from-green-500 to-green-600",
      "Speaking": "bg-gradient-to-r from-orange-500 to-orange-600",
      "Writing": "bg-gradient-to-r from-pink-500 to-pink-600"
    };
    
    if (!category) return null;
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium text-white rounded-full shadow-sm ${categoryColors[category] || "bg-gradient-to-r from-neutral-400 to-neutral-500"}`}>
        {category}
      </span>
    );
  };

  return (
    <Card>
      <div className="p-4 hover:bg-gradient-to-r hover:from-primary-25 hover:to-accent-25 transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary-400">
        <div className="flex items-center justify-between">
          {/* File Info */}
          <div className="flex items-center gap-4 flex-1">
            {/* File Icon */}
            <div className="flex-shrink-0">
              {getFileIcon(material.fileType)}
            </div>
            
            {/* File Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-primary-800 truncate">
                  {material.title}
                </h4>
                {getCategoryBadge(material.category)}
              </div>
              <p className="text-sm text-neutral-600 truncate mb-2">
                {material.fileName}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-accent-600 flex items-center gap-1 bg-accent-50 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  {material.uploadDate}
                </span>
                <span className="text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full font-medium">
                  {material.fileSize}
                </span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex-shrink-0 ml-4">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onDownload(material)}
              iconLeft={<Download className="w-4 h-4" />}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg"
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
      <div className="p-4 bg-white ">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </div>
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                <Filter className="w-3 h-3 text-white" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full pl-12 pr-8 py-3 border border-accent-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 appearance-none bg-white shadow-sm transition-all duration-200"
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
              <div className="p-8 text-center bg-gradient-to-br from-neutral-50 to-primary-25">
                <div className="w-16 h-16 bg-gradient-to-br from-neutral-400 to-neutral-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-primary-800 mb-2">
                  No materials found
                </h3>
                <p className="text-neutral-600 mb-4">
                  {searchTerm || selectedCategory 
                    ? "Try adjusting your search or filter criteria."
                    : "No public materials are available at the moment."
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <Button
                    variant="primary"
                    className="mt-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
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
            <div className="p-4 bg-gradient-to-r from-success-25 via-info-25 to-warning-25">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{materials.length}</span>
                    </div>
                    <span className="text-sm font-medium text-success-700">Total Materials</span>
                  </div>
                  <div className="w-px h-6 bg-neutral-300"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-info-500 to-info-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{filteredMaterials.length}</span>
                    </div>
                    <span className="text-sm font-medium text-info-700">Filtered Results</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-3 py-2 rounded-lg shadow-sm">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Public Library</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}