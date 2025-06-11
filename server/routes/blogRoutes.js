import express from 'express';
import Blog from '../model/Blog.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Create a new blog post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title,subtitle, content, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Upload image to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const cloudinaryResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'blog_images',
      resource_type: 'auto'
    });

    const blog = new Blog({
      title,
      subtitle,
      content,
      category,
      imageUrl: cloudinaryResponse.secure_url,
      cloudinaryId: cloudinaryResponse.public_id,
      author: req.user._id,
      status: req.user.role === 'admin' ? 'published' : 'pending'
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({ error: 'Error creating blog post' });
  }
});

// Get all published blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name')
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blogs' });
  }
});

// Get user's blogs
router.get('/user/post', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user blogs' });
  }
});

// Get pending blogs (admin only)
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const blogs = await Blog.find({ status: 'pending' })
      .populate('author', 'name')
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending blogs' });
  }
});

// Update blog status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Error updating blog status' });
  }
});

// Delete blog
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(blog.cloudinaryId);
    
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting blog' });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name');
    
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ error: 'Blog not found or not published' });
    }
    
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching blog' });
  }
});



export default router;