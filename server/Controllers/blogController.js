import Blog from '../model/Blog.js';

export const createBlog = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    console.log('Image URL:', imageUrl);
    console.log('Request Body:', req.body);
    const blog = new Blog({
      title,
      content,
      category,
      imageUrl,
      author: req.user.id,
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name')
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'pending' })
      .populate('author', 'name')
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBlogStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .sort('-createdAt');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};