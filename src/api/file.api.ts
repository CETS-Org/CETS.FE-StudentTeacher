export const uploadToPresignedUrl = (url: string, file: File, contentType: string) =>
  fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
  });


