import express from "express";
import {
  createIssue,
  getIssuesByProject,
  getIssueById,
  updateIssue,
  deleteIssue,
  getIssuesByUser,
} from "../controllers/issueController.js";
import commentRouter from "./commentRoutes.js";
import attachmentRouter from "./attachmentRoutes.js";

const router = express.Router({ mergeParams: true });

// if nested: POST /api/projects/:projectId/issues and GET /api/projects/:projectId/issues
router.post("/", createIssue);
router.get("/", getIssuesByProject);

// top-level issue ops: GET /api/issues/:id, PUT /api/issues/:id, DELETE /api/issues/:id
router.get("/user/:userId", getIssuesByUser);
router.get("/:id", getIssueById);
router.put("/:id", updateIssue);
router.delete("/:id", deleteIssue);

// Comments for issues
router.use('/:id/comments', commentRouter)  // id = issue id in issueRoutes

// Attachments for issues
router.use('/:id/attachments', attachmentRouter)  // id = issue id in issueRoutes

export default router;
