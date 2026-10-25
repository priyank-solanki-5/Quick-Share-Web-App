import { createShareSession, getSessionMetadata, getDownloadSession, deleteSession } from '../services/fileService.js';

/**
 * Handle file upload and Cloudinary share code creation.
 */
export async function sendFileController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const baseUrl = req.body.baseUrl || req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const result = await createShareSession(req.file, baseUrl);

    return res.status(201).json({
      success: true,
      message: 'File uploaded to Cloudinary & 6-digit code generated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in sendFileController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file to Cloudinary'
    });
  }
}

/**
 * Validate 6-digit code and fetch file metadata.
 */
export function receiveFileInfoController(req, res) {
  try {
    const { code } = req.params;
    if (!code || code.trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit code format' });
    }

    const metadata = getSessionMetadata(code.trim());
    if (!metadata) {
      return res.status(404).json({ success: false, message: 'Invalid or expired code' });
    }

    return res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Error in receiveFileInfoController:', error);
    return res.status(500).json({ success: false, message: 'Internal server error validating code' });
  }
}

/**
 * Redirect or stream file from Cloudinary matching 6-digit code.
 */
export async function downloadFileController(req, res) {
  try {
    const { code } = req.params;
    if (!code || code.trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit code format' });
    }

    const session = getDownloadSession(code.trim());
    if (!session || !session.cloudinary || !session.cloudinary.secure_url) {
      return res.status(404).json({ success: false, message: 'Invalid or expired code' });
    }

    // Stream download from Cloudinary URL with attachment disposition
    const fileUrl = session.cloudinary.secure_url;
    
    // Redirect to Cloudinary secure URL for direct CDN download
    return res.redirect(fileUrl);
  } catch (error) {
    console.error('Error in downloadFileController:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while downloading file' });
  }
}
