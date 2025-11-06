  // Helper function to format date
  export const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Helper function to get status display
  export const getStatusDisplay = (statusId: string) => {
    switch (statusId) {
      case "1": return "Active";
      case "2": return "Inactive";
      case "3": return "Suspended";
      default: return "Unknown";
    }
  };

  // Helper function to get status color
 export const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case "1": return "bg-green-100 text-green-800";
      case "2": return "bg-red-100 text-red-800";
      case "3": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };