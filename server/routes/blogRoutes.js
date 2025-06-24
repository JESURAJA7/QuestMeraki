import express from 'express';
import Blog from '../model/Blog.js';
import User from '../model/User.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Create a new blog post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title,subtitle, content, category } = req.body;
    console.log('Creating blog post:', title, subtitle, content, category);
    
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
    console.log('Updating blog status:', req.params.id, status);
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


router.get('/u/:id',  async (req, res) => {
  try {
    console.log('Fetching blog with ID:', req.params.id);
    const blog = await Blog.findById(req.params.id).populate('author', 'name');
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update blog post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Check if user is admin or the author of the post
    if (req.user.role !== 'admin' && blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    let imageUrl = blog.imageUrl;

    // Handle image upload if new image is provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary if it exists
        if (blog.imageUrl) {
          const publicId = blog.imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'blog-images',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ error: 'Failed to upload image' });
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        imageUrl,
        excerpt: content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('author', 'name');

    res.json(updatedBlog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// get blog download by id
router.get('/download/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Create a downloadable file
    const fileName = `${blog.title.replace(/\s+/g, '_')}.txt`;
    const content = `Title: ${blog.title}\n\nSubtitle: ${blog.subtitle}\n\nContent:\n${blog.content}\n\nCategory: ${blog.category}\n\nAuthor: ${blog.author.name}`;
    
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: 'Error downloading blog post' });
  }
});


// Get all blogs for admin with optional status filter
router.get('/admin/all', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    console.log('Fetching all blogs for admin with status:', status, 'page:', page, 'limit:', limit);
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// get user role
router.get('/user/:id/role', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('role');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user role' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, timestamp, userAgent, referrer } = req.body;

    // Find the blog
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    // Optional: Store detailed view analytics
    // You can create a separate ViewAnalytics model for detailed tracking
    
    res.json({ 
      success: true, 
      views: blog.views,
      message: 'View tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ message: 'Failed to track view' });
  }
});

// Get blog view count
router.get('/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id).select('views');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ viewCount: blog.views || 0 });
  } catch (error) {
    console.error('Error getting view count:', error);
    res.status(500).json({ message: 'Failed to get view count' });
  }
});

// Get trending blogs
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get blogs sorted by views (descending) with growth rate calculation
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name email')
      .sort({ views: -1, createdAt: -1 })
      .limit(limit);

    // Calculate growth rate (you can implement more sophisticated logic)
    const trendingBlogs = blogs.map(blog => ({
      ...blog.toObject(),
      growthRate: Math.random() * 50 + 5 // Mock growth rate for now
    }));

    res.json(trendingBlogs);
  } catch (error) {
    console.error('Error getting trending blogs:', error);
    res.status(500).json({ message: 'Failed to get trending blogs' });
  }
});

// Get popular blogs
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name email')
      .sort({ views: -1 })
      .limit(limit);

    res.json(blogs);
  } catch (error) {
    console.error('Error getting popular blogs:', error);
    res.status(500).json({ message: 'Failed to get popular blogs' });
  }
});


export default router;