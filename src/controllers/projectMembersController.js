import prisma from "../config/db.js";
import { sendProjectMemberEmail, sendProjectMemberRemoveEmail } from "../services/emailService.js";

export const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role },
    });

    // Fetch user, project to get and send email
    const [ user, project, inviter ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.user.findUnique({ where: { id: req.user.id } })
    ]);

    // Fire and forget email (don't block response)
    if(user && user.isActive){
      sendProjectMemberEmail({
        to: user.email,
        inviterName: inviter ? inviter.name : "Admin",
        projectName: project ? project.name : "Project",
        projectUrl: `${process.env.FRONTEND_URL}/projects/${projectId}`
      })
    }

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true }, // Include user details
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const updatedMember = await prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { role },
    });
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const deletedMember = await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });

    // Fetch user, project to get and send email
    const [ user, project, inviter ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.user.findUnique({ where: { id: req.user.id } })
    ]);

    // Fire and forget email (don't block response)
    if(user && user.isActive){
      sendProjectMemberRemoveEmail({
        to: user.email,
        inviterName: inviter ? inviter.name : "Admin",
        projectName: project ? project.name : "Project",
        projectUrl: `${process.env.FRONTEND_URL}/projects/${projectId}`
      })
    }

    res.status(200).json({ message: "Member removed" }, deletedMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
