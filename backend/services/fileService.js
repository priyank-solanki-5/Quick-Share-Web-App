import streamifier from 'streamifier';
import QRCode from 'qrcode';
import cloudinary from '../config/cloudinary.js';
import { generate6DigitCode } from '../utils/codeGenerator.js';

// In-memory store for active file sharing sessions
const activeSessions = new Map();

// Default expiration time: 10 minutes
const EXPIRATION_TIME_MS = 10 * 60 * 1000;

/**
 * Periodically cleans up expired sessions and removes files from Cloudinary.
 */
setInterval(async () => {
  const now = Date.now();
  for (const [code, session] of activeSessions.entries()) {
    if (now >= session.expiresAt) {
      await deleteSession(code);
    }
  }
}, 30 * 1000);

/**
 * Upload a memory buffer stream to Cloudinary
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @returns {Promise<Object>} Cloudinary upload result
 */
function uploadStreamToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'quick_share_files',
        resource_type: 'auto',
        use_filename: true,
        filename_override: originalName
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Helper to delete a session and its associated file on Cloudinary.
 */
export async function deleteSession(code) {
  const session = activeSessions.get(code);
  if (session) {
    if (session.cloudinary && session.cloudinary.public_id) {
      try {
        await cloudinary.uploader.destroy(session.cloudinary.public_id, {
          resource_type: session.cloudinary.resource_type || 'image'
        });
      } catch (err) {
        console.error(`Failed to delete Cloudinary file for code ${code}:`, err);
      }
    }
    activeSessions.delete(code);
  }
}

/**
 * Creates a new file share session with Cloudinary storage.
 * @param {Object} file - File object from multer memory storage
 * @param {string} baseUrl - Base URL of the client app (for QR code generation)
 * @returns {Promise<Object>} Session details including code, qrDataUrl, expiresAt
 */
export async function createShareSession(file, baseUrl) {
  let code;
  let attempts = 0;
  // Ensure unique 6-digit code among active sessions
  do {
    code = generate6DigitCode();
    attempts++;
  } while (activeSessions.has(code) && attempts < 100);

  // Upload file buffer to Cloudinary
  const cloudinaryResult = await uploadStreamToCloudinary(file.buffer, file.originalname);

  const expiresAt = Date.now() + EXPIRATION_TIME_MS;
  const receiveUrl = `${baseUrl.replace(/\/$/, '')}/receive?code=${code}`;

  // Generate QR code Data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(receiveUrl, {
      margin: 2,
      color: {
        dark: '#4f46e5',
        light: '#ffffff'
      },
      width: 250
    });
  } catch (err) {
    console.error('Error generating QR Code:', err);
  }

  const sessionData = {
    code,
    file: {
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    },
    cloudinary: {
      public_id: cloudinaryResult.public_id,
      secure_url: cloudinaryResult.secure_url,
      resource_type: cloudinaryResult.resource_type,
      format: cloudinaryResult.format
    },
    createdAt: Date.now(),
    expiresAt,
    receiveUrl,
    qrDataUrl
  };

  activeSessions.set(code, sessionData);

  // Schedule automatic cleanup at expiration
  setTimeout(async () => {
    await deleteSession(code);
  }, EXPIRATION_TIME_MS);

  return {
    code,
    qrDataUrl,
    receiveUrl,
    expiresAt,
    file: {
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    },
    downloadUrl: cloudinaryResult.secure_url
  };
}

/**
 * Retrieves session metadata by code. Returns null if invalid or expired.
 * @param {string} code 
 * @returns {Object|null}
 */
export function getSessionMetadata(code) {
  const session = activeSessions.get(code);
  if (!session) return null;

  if (Date.now() >= session.expiresAt) {
    deleteSession(code);
    return null;
  }

  return {
    code: session.code,
    expiresAt: session.expiresAt,
    file: {
      originalname: session.file.originalname,
      size: session.file.size,
      mimetype: session.file.mimetype
    },
    downloadUrl: session.cloudinary ? session.cloudinary.secure_url : null
  };
}

/**
 * Retrieves the full session for downloading.
 * @param {string} code 
 * @returns {Object|null}
 */
export function getDownloadSession(code) {
  const session = activeSessions.get(code);
  if (!session) return null;

  if (Date.now() >= session.expiresAt) {
    deleteSession(code);
    return null;
  }

  return session;
}
