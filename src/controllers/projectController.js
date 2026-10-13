import prisma from "../config/db.js";

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { name, description, ownerId } = req.body;
    const project = await prisma.project.create({
      data: { name, description, ownerId },
    });

    // Add creator as project member (ADMIN)
    const projectOwner = await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: "ADMIN",
      },
    });
    res.status(201).json(project, projectOwner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description },
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction([
      prisma.projectMember.deleteMany({ where: { projectId: id }}),
      prisma.issue.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({where: { id }}),
    ]);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get projects for the authenticated user
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserMemberProjects = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you've added user info via middleware (JWT/session)
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user projects" });
  }
};
