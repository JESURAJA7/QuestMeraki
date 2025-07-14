
import Download from '../model/download.js';
import Blog from '../model/Blog.js';
import { validationResult } from 'express-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Parser } from 'json2csv';



/**
 * Track a download
 */
export const trackDownload = async (req, res) => {
  //console.log('Tracking download request:', req.body);

  const errors = validationResult(req);
  console.log('Validation errors:', errors.array());
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { blogId, blogTitle, name, email, role, remarks } = req.body;

    const blog = await Blog.findById(blogId);
    console.log('Blog found:', blog);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const download = new Download({
      blogId,
      blogTitle,
      name,
      email,
      role,
      remarks,
      userAgent: req.body.userAgent || req.headers['user-agent'],
      ipAddress,
      referrer: req.body.referrer || req.headers['referer']
    });
    console.log('Download record:', download);

    await download.save();

    await Blog.findByIdAndUpdate(blogId, { $inc: { downloadCount: 1 } });

    res.status(201).json({
      message: 'Download tracked successfully',
      downloadId: download._id
    });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ message: 'Server error while tracking download' });
  }
};


/**
 * Get download statistics (for admin dashboard)
 */
export const getDownloadStats = async (req, res) => {
  //console.log('Fetching download stats...');
  try {
    // Total downloads
    const totalDownloads = await Download.countDocuments();
    //console.log('Total downloads:', totalDownloads);
    // Downloads in last 30 days
    const downloadsLast30Days = await Download.countDocuments({
      downloadedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    //console.log('Downloads in last 30 days:', downloadsLast30Days);

    // Top 5 most downloaded blogs
    const mostDownloaded = await Download.aggregate([
      {
        $group: {
          _id: '$blogId',
          blogTitle: { $first: '$blogTitle' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    //console.log('Most downloaded blogs:', mostDownloaded);
    // Download counts by purpose
    const downloadsByPurpose = await Download.aggregate([
      {
        $group: {
          _id: '$remarks', 
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
   // console.log('Downloads by purpose:', downloadsByPurpose);

    // Timeline of downloads over the last 7 days
    const timelineData = await Download.aggregate([
      {
        $match: {
          downloadedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$downloadedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    //console.log('Timeline data:', timelineData);

    res.json({
      totalDownloads,
      downloadsLast30Days,
      mostDownloaded,
      downloadsByPurpose,
      timelineData
    });
  
  } catch (error) {
    console.error('Error fetching download stats:', error);
    res.status(500).json({ message: 'Server error while fetching download stats' });
  }
};


/**
 * Get all downloads with pagination and filtering (for admin dashboard)
 */
export const getAllDownloads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      blogId,
      email,
      role,
      purpose,
      sortBy = '-downloadedAt'
    } = req.query;

    const query = {};
    if (blogId) query.blogId = blogId;
    if (email) query.email = { $regex: email, $options: 'i' };
    if (role) query.role = role;
    if (purpose) query.remarks = { $regex: purpose, $options: 'i' }; 

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortBy,
      populate: {
        path: 'blogId',
        select: 'title category'
      }
    };

    const downloads = await Download.paginate(query, options);

    res.json(downloads);
  } catch (error) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({ message: 'Server error while fetching downloads' });
  }
};

export const getDownloads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      dateFrom,
      dateTo,
      sortBy = 'downloadedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { blogTitle: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (dateFrom || dateTo) {
      filter.downloadedAt = {};
      if (dateFrom) {
        filter.downloadedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.downloadedAt.$lte = endDate;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [downloads, total] = await Promise.all([
      Download.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('blogId', 'title')
        .lean(),
      Download.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));
    res.json({
      success: true,
      data: downloads,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching downloads:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch downloads', error: error.message });
  }
};

/**
 * Track a download
 */
export const createDownload = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { blogId, blogTitle, name, email, role, remarks } = req.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const download = new Download({
      blogId,
      blogTitle,
      name,
      email,
      role,
      remarks,
      userAgent: req.headers['user-agent'],
      ipAddress,
      referrer: req.headers['referer']
    });

    await download.save();
    await Blog.findByIdAndUpdate(blogId, { $inc: { downloadCount: 1 } });

    res.status(201).json({ message: 'Download tracked successfully', downloadId: download._id });
  } catch (error) {
    console.error('Error tracking download:', error);
    res.status(500).json({ message: 'Server error while tracking download' });
  }
};

/**
 * Export downloads to CSV
 */
export const exportToCSV = async (req, res) => {
  try {
    const { role, dateFrom, dateTo, format = 'csv' } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (dateFrom || dateTo) {
      filter.downloadedAt = {};
      if (dateFrom) filter.downloadedAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.downloadedAt.$lte = endDate;
      }
    }

    const downloads = await Download.find(filter)
      .sort({ downloadedAt: -1 })
      .populate('blogId', 'title')
      .lean();

    const exportData = downloads.map(d => ({
      Name: d.name,
      Email: d.email,
      Role: d.role,
      'Blog Title': d.blogTitle,
      'Blog ID': d.blogId,
      Remarks: d.remarks || '',
      'Download Date': d.downloadedAt.toISOString().split('T')[0],
      'Download Time': d.downloadedAt.toTimeString().split(' ')[0],
      'User Agent': d.userAgent || '',
      'IP Address': d.ipAddress || ''
    }));

    if (format === 'json') {
      return res.json({ success: true, data: exportData, total: exportData.length });
    }

    const fields = Object.keys(exportData[0] || {});
    const parser = new Parser({ fields });
    const csv = parser.parse(exportData);
    const filename = `downloads-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting downloads:', error);
    res.status(500).json({ success: false, message: 'Failed to export downloads', error: error.message });
  }
};

/**
 * Delete multiple downloads
 */
export const deleteDownloads = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of download IDs to delete' });
    }

    const result = await Download.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} download records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting downloads:', error);
    res.status(500).json({ success: false, message: 'Failed to delete download records', error: error.message });
  }
};

/**
 * Get a download by ID
 */
export const getDownloadById = async (req, res) => {
  try {
    const { id } = req.params;
    const download = await Download.findById(id)
      .populate('blogId', 'title')
      .populate('userId', 'name email');

    if (!download) {
      return res.status(404).json({ success: false, message: 'Download record not found' });
    }

    res.json({ success: true, data: download });
  } catch (error) {
    console.error('Error fetching download:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch download record', error: error.message });
  }
};

/**
 * Get download analytics
 */
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    let dateFilter = {};
    const now = new Date();

    const timeMap = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    if (timeMap[period]) {
      dateFilter = {
        downloadedAt: { $gte: new Date(now.getTime() - timeMap[period] * 24 * 60 * 60 * 1000) }
      };
    }

    const [totalDownloads, downloadsOverTime, topReferrers, deviceStats] = await Promise.all([
      Download.countDocuments(dateFilter),
      Download.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$downloadedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Download.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$blogTitle', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Download.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $cond: {
                if: { $regexMatch: { input: "$userAgent", regex: /Mobile|Android|iPhone/ } },
                then: "Mobile",
                else: "Desktop"
              }
            },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalDownloads,
        downloadsOverTime,
        topReferrers,
        deviceStats,
        period
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};
