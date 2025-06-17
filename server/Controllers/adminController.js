import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants.js';
import User from '../model/User.js';
import Blog from '../model/Blog.js';

export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: 'admin' 
    });
    await admin.save();
    
    const token = jwt.sign({ userId: admin._id }, JWT_SECRET);
    res.status(201).json({ 
      token, 
      user: { 
        id: admin._id, 
        name, 
        email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new Error('Invalid credentials');
    } 
    const token = jwt.sign({ userId: admin._id }, JWT_SECRET);
    res.json({ 
      token, 
      user: { 
        id: admin._id, 
        name: admin.name, 
        email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get admin stats for dashboard
export const stateAdmin = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBlogs = await Blog.countDocuments();
    const pendingBlogs = await Blog.countDocuments({ status: 'pending' });
    const publishedBlogs = await Blog.countDocuments({ status: 'published' });

    res.json({
      totalUsers,
      publishedBlogs,
      totalBlogs,
      pendingBlogs
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error fetching admin stats' });
  }
};