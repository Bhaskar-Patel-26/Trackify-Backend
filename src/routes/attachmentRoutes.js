import express from "express";
import { listAttachments, removeAttachment, uploadAttachments } from '../controllers/attachmentController.js';
import upload from '../utils/multer.js';
import { authenticate } from "../utils/jwt.js";

const router = express.Router({ mergeParams: true });

router.post('/', authenticate, upload.array('files', 5), uploadAttachments);
router.get('/', listAttachments);
router.delete('/:attachmentId', removeAttachment);

export default router;
