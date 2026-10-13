import express from 'express';
import { listNotifications, markAsRead, createNotification, deleteNotification } from '../controllers/notificationController.js';
const router = express.Router({ mergeParams: true });

router.post('/', createNotification);       // POST /api/users/:userId/notifications
router.get('/', listNotifications);         // GET /api/users/:userId/notifications
router.put('/:notificationId/read', markAsRead); // PUT /api/users/:userId/notifications/:notificationId/read
router.delete('/:notificationId', deleteNotification);

export default router;
