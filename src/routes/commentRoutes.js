import express from "express";
import { createComment, listComments, updateComment, deleteComment } from '../controllers/commentController.js';
import { authenticate } from "../utils/jwt.js";

const router = express.Router({ mergeParams: true });

router.post("/", authenticate, createComment);    // POST /api/issues/:issueId/comments
router.get("/", listComments);      // GET  /api/issues/:issueId/comments
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;
