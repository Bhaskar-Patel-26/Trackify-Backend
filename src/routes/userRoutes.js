import express from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
} from "../controllers/userController.js";
import notificationRouter from "./notificationRoutes.js";

import { authenticate, authorizeRole } from "../utils/jwt.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/:id", updateUser);

// 🔓 Any logged-in user can view their own profile
router.get("/me", authenticate, getMe);

// Nested notification routes
router.use("/:userId/notifications", authenticate, notificationRouter);

// 🔐 Only authenticated admins can manage users
router.use(authenticate, authorizeRole(["ADMIN"]));

router.post("/", createUser);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

export default router;
