import prisma from "../config/db.js";
import bcrypt from "bcryptjs";

// Admin only - Create user
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashedPassword },
    });
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin only - Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({where: { isActive: true }});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin only - Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin only - Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role },
    });
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin only - Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // 2️⃣ Prevent deleting superadmin
    if (user.role === "SUPERADMIN") {
      return res.status(403).json({ error: "Cannot delete Super Admin" });
    }
    // 3️⃣ Find the Super Admin
    const superAdmin = await prisma.user.findFirst({
      where: { role: "SUPERADMIN", isActive: true }
    });
    if (!superAdmin) {
      return res.status(500).json({ error: "Super Admin account not found. Cannot reassign projects." });
    }

    // 4️⃣ Transfer ownership of all projects owned by this user
    await prisma.project.updateMany({
      where: { ownerId: id },
      data: { ownerId: superAdmin.id }
    });

    // 5️⃣ Soft delete user
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });

    res.status(200).json({
        message: "User soft deleted and projects reassigned to Super Admin",
        user: deletedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Any logged-in user - Get own profile
export const getMe = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
