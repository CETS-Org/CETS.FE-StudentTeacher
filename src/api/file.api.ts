export const uploadToPresignedUrl = (url: string, file: File, contentType: string) =>
  fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
  });

export const uploadJsonToPresignedUrl = async (url: string, jsonData: string) => {
  try {
    // Create a File object from the JSON string to match the expected format
    // This ensures compatibility with the existing uploadToPresignedUrl function
    const fileName = url.split('/').pop() || 'assignment.json';
    const jsonFile = new File([jsonData], fileName, { type: 'application/json' });
    
    // Use the same upload logic as regular files
    const response = await fetch(url, {
      method: 'PUT',
      body: jsonFile,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      // Log more detailed error information
      const errorText = await response.text();
      console.error('Upload failed with details:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: url.substring(0, 100) + '...' // Log first 100 chars of URL for debugging
      });
      throw new Error(`Upload failed with status: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('Error uploading JSON to presigned URL:', error);
    throw error;
  }
};
