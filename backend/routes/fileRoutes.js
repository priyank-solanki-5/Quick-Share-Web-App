import express from 'express';
import multer from 'multer';
import { sendFileController, receiveFileInfoController, downloadFileController } from '../controller/fileController.js';

// Multer memory storage - buffer file directly into memory for streaming to Cloudinary
const storage = multer.memoryStorage();

// Max file size: 50MB
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const router = express.Router();

router.post('/send', upload.single('file'), sendFileController);
router.get('/receive/:code', receiveFileInfoController);
router.get('/download/:code', downloadFileController);

export default router;
