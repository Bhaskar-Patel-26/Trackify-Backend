import express from "express";
import { authenticate } from "../utils/jwt.js";
import membersRouter from "./projectMembersRoutes.js";
import issueRouter from './issueRoutes.js';

import {
  getUserProjects,
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getUserMemberProjects
} from "../controllers/projectController.js";

const router = express.Router();

router.get("/me", authenticate, getUserProjects);
router.get("/myProjects", authenticate , getUserMemberProjects);
router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);


router.use("/:projectId/members", membersRouter);
router.use('/:projectId/issues', issueRouter);

export default router;
