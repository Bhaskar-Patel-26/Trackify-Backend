import prisma from "../config/db.js";
import { sendCommentNotificationEmail } from "../services/emailService.js";

export const createComment = async (req, res) => {
  try {
    const issueId = req.params.issueId || req.params.id;
    const { userId, content } = req.body;
    const comment = await prisma.comment.create({
      data: { issueId, userId, content },
      
    });

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: { assignee: true, reporter: true },
    })

    const recipients = [];
    if (issue.reporter && issue.reporter.isActive) recipients.push(issue.reporter.email);
    if (issue.assignee && issue.assignee.isActive) recipients.push(issue.assignee.email);

    // Send notification emails to issue reporter and assignee
    if (recipients.length) {
      for(const email of recipients) {
        sendCommentNotificationEmail({
          to: email,
          commenterName: req.user.email,
          commentText: content,
          issueTitle: issue.title,
          issueUrl: `${process.env.FRONTEND_URL}/projects/${issue.projectId}/issues/${issue.id}`
        }).catch(err => console.error("Error sending comment notification email:", err));
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listComments = async (req, res) => {
  try {
    const issueId = req.params.issueId || req.params.id;
    const comments = await prisma.comment.findMany({
      where: { issueId },
      include: { author: true },
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const data = req.body;
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
