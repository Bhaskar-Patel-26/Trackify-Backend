import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashedPassword },
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({ 
        message: 'User registered successfully',
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user);
        res.status(200).json({
            message: 'User logged in successfully',
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Logout user
export const logoutUser = (req, res) => {
    // For JWT, logout is handled on the client side by deleting the token.
    res.json({ message: "User logged out successfully" });
}