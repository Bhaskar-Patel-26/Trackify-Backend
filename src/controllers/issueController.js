import prisma from "../config/db.js";
import { sendIssueAssignedEmail } from "../services/emailService.js";

export const createIssue = async (req, res) => {
  try {
    // if nested, projectId can come from params; fallback to body
    const projectId = req.params.projectId || req.body.projectId;
    const { title, description, assigneeId, reporterId, priority, status, dueDate } = req.body;
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
        reporterId,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    if (assigneeId) {
      const [assignee, project] = await Promise.all([
        prisma.user.findUnique({ where: { id: assigneeId } }),
        prisma.project.findUnique({ where: { id: projectId } })
      ]);
      if (assignee && assignee.isActive) {
        sendIssueAssignedEmail({
          to: assignee.email,
          assigneeName: assignee.name,
          issueTitle: issue.title,
          projectName: project.name,
          issueUrl: `${process.env.FRONTEND_URL}/projects/${projectId}/issues/${issue.id}`
        }).catch(e => console.error("SendGrid error:", e));
      }
    }
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssuesByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const issues = await prisma.issue.findMany({
      where: { projectId },
      include: { assignee: true, reporter: true },
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { assignee: true, reporter: true, project: true },
    });
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    res.status(200).json(issue);
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};

export const updateIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.issue.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.issue.delete({ where: { id } });
    res.json({ message: "Issue deleted" });
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};

export const getIssuesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const issues = await prisma.issue.findMany({
      where: { assigneeId: userId },
      include: { assignee: true, reporter: true },
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
