/**
 * Service to handle uploading files to Google Drive using the REST API v3.
 */

/**
 * Searches for a folder by name and parent folder ID. 
 * If it doesn't exist, it creates it automatically.
 */
async function getOrCreateFolder(
  folderName: string,
  accessToken: string,
  parentId?: string
): Promise<string> {
  const queryParts = [
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `trashed = false`
  ];
  
  if (parentId) {
    queryParts.push(`'${parentId}' in parents`);
  } else {
    queryParts.push(`'root' in parents`);
  }

  const query = queryParts.join(' and ');
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  
  const searchResponse = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (searchResponse.ok) {
    const searchResult = await searchResponse.json();
    if (searchResult.files && searchResult.files.length > 0) {
      return searchResult.files[0].id;
    }
  } else {
    const errText = await searchResponse.text();
    console.warn(`Search folder "${folderName}" warning:`, errText);
  }

  // Create the folder if not found
  const createMetadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    createMetadata.parents = [parentId];
  }

  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createMetadata),
  });

  if (!createResponse.ok) {
    const errText = await createResponse.text();
    throw new Error(`Gagal membuat folder Google Drive "${folderName}": ${createResponse.status} - ${errText}`);
  }

  const createResult = await createResponse.json();
  return createResult.id;
}

export async function uploadFileToGoogleDrive(
  file: File,
  accessToken: string,
  projectName?: string,
  categoryName?: string
): Promise<{ id: string; webViewLink: string; mimeType: string; folderId?: string }> {
  try {
    const boundary = 'dfw_gdrive_upload_boundary';
    let targetFolderId: string | undefined;

    // 1. Automatically resolve or build foldering hierarchy
    // Create an overall App Root folder to keep everything clean and organized.
    const appRootFolderId = await getOrCreateFolder("DFW Monitoring Sistem V3", accessToken);
    targetFolderId = appRootFolderId;

    if (projectName) {
      // Find or create project folder inside the "DFW Monitoring Sistem V3" root folder
      const projectFolderId = await getOrCreateFolder(projectName, accessToken, appRootFolderId);
      targetFolderId = projectFolderId;

      if (categoryName) {
        // Find or create category folder inside the project folder
        const categoryFolderId = await getOrCreateFolder(categoryName, accessToken, projectFolderId);
        targetFolderId = categoryFolderId;
      }
    }

    const metadata: any = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
    };

    if (targetFolderId) {
      metadata.parents = [targetFolderId];
    }

    // Read file in as an ArrayBuffer
    const reader = new FileReader();
    const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = (err) => reject(err);
    });
    reader.readAsArrayBuffer(file);
    const fileData = await fileDataPromise;

    // Build the multipart request body
    const metadataPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const mediaPartHeader = `--${boundary}\r\nContent-Type: ${metadata.mimeType}\r\n\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const blob = new Blob([
      metadataPart,
      mediaPartHeader,
      new Uint8Array(fileData),
      closeDelim
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
      mimeType: result.mimeType || file.type || 'application/octet-stream',
      folderId: targetFolderId
    };
  } catch (error: any) {
    console.error('Failed to upload file to Google Drive with automatic folders:', error);
    throw error;
  }
}

export async function deleteFileFromGoogleDrive(
  fileId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.ok) {
      return true;
    } else {
      const errText = await response.text();
      console.warn(`Gagal menghapus file di Google Drive: ${response.status} - ${errText}`);
      throw new Error(`Google Drive delete error: ${response.status} - ${errText}`);
    }
  } catch (error) {
    console.error(`Failed to delete file ${fileId} from Google Drive:`, error);
    throw error;
  }
}


