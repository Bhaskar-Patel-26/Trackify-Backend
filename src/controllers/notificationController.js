import prisma from '../config/db.js';

export const listNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const notes = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    res.json(notes);
  } catch (err) { next(err); }
};

export const createNotification = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, message } = req.body;
    const note = await prisma.notification.create({ data: { userId, type, message } });
    res.status(201).json(note);
  } catch (err) { next(err); }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const updated = await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
    res.json(updated);
  } catch (err) { next(err); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await prisma.notification.delete({ where: { id: notificationId } });
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
};
