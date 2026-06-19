/**
 * Service to handle uploading files to Google Drive using the REST API v3.
 */
export async function uploadFileToGoogleDrive(
  file: File,
  accessToken: string
): Promise<{ id: string; webViewLink: string; mimeType: string }> {
  try {
    const boundary = 'dfw_gdrive_upload_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    // Read file in as an ArrayBuffer
    const reader = new FileReader();
    const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (err) => reject(err);
    });
    reader.readAsArrayBuffer(file);
    const fileData = await fileDataPromise;

    // Build the multipart request body
    const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const mediaPartHeader = `Content-Type: ${metadata.mimeType}\r\n\r\n`;

    const blob = new Blob([
      metadataPart,
      mediaPartHeader,
      new Uint8Array(fileData),
      close_delim
    ]);

    // Send to Google Drive Upload API
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,mimeType',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: blob,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const result = await response.json();
    return {
      id: result.id,
      webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
      mimeType: result.mimeType || file.type || 'application/octet-stream'
    };
  } catch (error: any) {
    console.error('Failed to upload file to Google Drive:', error);
    throw error;
  }
}
