import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Tag, Search, Filter, Grid, List, SortAsc, SortDesc, Eye, Heart, Bookmark, Share2, Download, ArrowRight, User, TrendingUp, BookOpen, Star, Sparkles } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  imageUrl: string;
  category: string;
  views?: number;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination settings
  const BLOGS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const categories = ["All", "Palms of his Hands", "Perspective", "Questionnaires", "Ideating zone",'others'];

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [blogs, selectedMonth, selectedYear, selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedMonth, selectedYear, selectedCategory, searchTerm, sortBy]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_URL}/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (error) {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = () => {
    let filtered = blogs;

    // Filter by search term with null/undefined checks
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(blog => {
        // Safe string checks with fallbacks
        const title = blog?.title || '';
        const excerpt = blog?.excerpt || '';
        const authorName = blog?.author?.name || '';

        return (
          title.toLowerCase().includes(searchLower) ||
          excerpt.toLowerCase().includes(searchLower) ||
          authorName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog?.category === selectedCategory);
    }

    // Filter by date
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      filtered = filtered.filter(blog => {
        if (!blog?.createdAt) return false;
        const blogDate = new Date(blog.createdAt);
        return blogDate.getMonth() === monthIndex && blogDate.getFullYear() === selectedYear;
      });
    }

    // Sort blogs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime();
        case 'popular':
          return (b?.views || 0) - (a?.views || 0);
        default:
          return 0;
      }
    });

    setFilteredBlogs(filtered);
  };

  // Get current page blogs
  const getCurrentPageBlogs = () => {
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    return filteredBlogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);
  };

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-center mt-12 space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex space-x-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={page === '...'}
              className={`min-w-[40px] h-10 rounded-xl font-medium transition-all duration-300 ${currentPage === page
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                : page === '...'
                  ? 'bg-transparent text-gray-400 cursor-default'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105'
                }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-md group"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  };

  const downloadBlogAsPDF = async (blog: Blog) => {
    setDownloadingId(blog._id);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Cover page
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(30, 30, 100);
      pdf.text(blog.title || 'Untitled', pageWidth / 2, pageHeight / 3, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`By ${blog.author?.name || 'Unknown Author'}`, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });

      pdf.text(
        new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        pageWidth / 2,
        pageHeight / 3 + 35,
        { align: 'center' }
      );

      pdf.addPage();
      yPosition = margin;

      // Header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, 0, pageWidth, 40, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(50, 50, 150);
      pdf.text('QuestMeraki', margin, 25);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Premium Blog Content', pageWidth - margin, 25, { align: 'right' });

      yPosition = 50;

      // Title block
      pdf.setFillColor(30, 30, 100);
      pdf.rect(margin, yPosition - 10, pageWidth - 2 * margin, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(blog.title || 'Untitled', pageWidth / 2, yPosition + 3, { align: 'center' });

      yPosition += 25;

      // Metadata
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);

      const authorText = `👤 ${blog.author?.name || 'Unknown Author'}`;
      const categoryText = `🏷️ ${blog.category || 'Uncategorized'}`;
      const dateText = `📅 ${new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`;

      const metadataSpacing = (pageWidth - 2 * margin) / 3;

      pdf.text(authorText, margin, yPosition);
      pdf.text(categoryText, margin + metadataSpacing, yPosition);
      pdf.text(dateText, margin + metadataSpacing * 2, yPosition);

      yPosition += 20;

      // Divider
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;

      // Content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = blog.content || blog.excerpt || 'No content available';

      const unwantedElements = tempDiv.querySelectorAll('script, style, iframe');
      unwantedElements.forEach(el => el.remove());

      const rawParagraphs: string[] = [];
      tempDiv.querySelectorAll('p, div').forEach(node => {
        const text = node.textContent?.trim();
        if (text && !/^[\s\u00A0]*$/.test(text)) {
          rawParagraphs.push(text);
        }
      });

      const paragraphs = rawParagraphs.length
        ? rawParagraphs
        : (tempDiv.textContent || '')
          .split(/\r?\n+/)
          .map(p => p.trim())
          .filter(p => p.length > 0);

      // Add text helper
      const addText = (
        text: string,
        fontSize: number,
        isBold = false,
        color: [number, number, number] = [0, 0, 0],
        lineHeight = 1.5
      ) => {
        if (!text.trim()) return;

        pdf.setFontSize(fontSize);
        pdf.setTextColor(...color);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        const lineHeightPx = fontSize * lineHeight;
        const spaceNeeded = lines.length * lineHeightPx;

        if (yPosition + spaceNeeded > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.text(lines, margin, yPosition);
        yPosition += spaceNeeded + fontSize * 0.5;
      };

      // Render paragraphs
      for (const para of paragraphs) {
        const isQuote = para.startsWith('"') || para.startsWith('"');
        const style: { fontSize: number; isBold: boolean; color: [number, number, number] } = isQuote
          ? { fontSize: 11, isBold: true, color: [100, 50, 150] }
          : { fontSize: 11, isBold: false, color: [60, 60, 60] };
        addText(para, style.fontSize, style.isBold, style.color);
      }

      // Footer on all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`QuestMeraki`, margin, pageHeight - 8);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      }

      // Save file
      const fileName = `${(blog.title || 'blog')
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase()}.pdf`;

      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getAvailableMonths = () => {
    const availableMonths = new Set<string>();
    const categoryFilteredBlogs = selectedCategory === 'All'
      ? blogs
      : blogs.filter(blog => blog?.category === selectedCategory);

    categoryFilteredBlogs.forEach(blog => {
      if (blog?.createdAt) {
        const blogDate = new Date(blog.createdAt);
        if (blogDate.getFullYear() === selectedYear) {
          availableMonths.add(months[blogDate.getMonth()]);
        }
      }
    });
    return Array.from(availableMonths).sort((a, b) => months.indexOf(a) - months.indexOf(b));
  };

  const getAvailableYears = () => {
    const years = new Set<number>();
    const categoryFilteredBlogs = selectedCategory === 'All'
      ? blogs
      : blogs.filter(blog => blog?.category === selectedCategory);

    categoryFilteredBlogs.forEach(blog => {
      if (blog?.createdAt) {
        years.add(new Date(blog.createdAt).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const getBlogCountByCategory = (category: string) => {
    if (category === 'All') return blogs.length;
    return blogs.filter(blog => blog?.category === category).length;
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear());
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear());
    setSearchTerm('');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 mt-5 mb-10">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-100"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPageBlogs = getCurrentPageBlogs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50  via-white to-purple-50  ">
      <div className="container mx-auto px-5 ">


        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>



            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'
                    ? 'bg-white shadow-sm text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${showFilters
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Date Filters
              </button>
            </div>
          </div>

          {/* Expanded Filters - Now only contains date filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={getAvailableYears().length === 0}
                  >
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Months</option>
                    {getAvailableMonths().map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Category Filter - Moved outside the filter section */}
        <div className="mb-6 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full transition-all duration-200 flex items-center space-x-2 ${selectedCategory === category
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span>{category}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${selectedCategory === category
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}>
                  {getBlogCountByCategory(category)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== 'All' || selectedMonth || searchTerm) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMonth && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Date: {selectedMonth} {selectedYear}
                  <button
                    onClick={() => setSelectedMonth('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory !== 'All' && selectedMonth
              ? `${selectedCategory} - ${selectedMonth} ${selectedYear} Posts`
              : selectedCategory !== 'All'
                ? `${selectedCategory} Posts`
                : selectedMonth
                  ? `${selectedMonth} ${selectedYear} Posts`
                  : searchTerm
                    ? `Search Results for "${searchTerm}"`
                    : 'All Stories'
            }
            <span className="text-lg font-normal text-gray-600 ml-2">
              ({filteredBlogs.length} {filteredBlogs.length === 1 ? 'story' : 'stories'})
            </span>
          </h2>

          {totalPages > 1 && (
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Blog Grid/List */}
        {currentPageBlogs.length > 0 ? (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
            : 'space-y-6'
          }>
            {currentPageBlogs.map((blog, index) => (
              <div
                key={blog._id}
                className={`transform transition-all duration-300 hover:scale-[1.02] ${viewMode === 'list' ? 'max-w-4xl mx-auto' : ''
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {viewMode === 'grid' ? (
                  <BlogCard
                    id={blog._id}
                    title={blog.title || 'Untitled'}
                    excerpt={blog.excerpt || 'No excerpt available'}
                    author={blog.author?.name || 'Unknown Author'}
                    date={new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    imageUrl={blog.imageUrl}
                    category={blog.category || 'Uncategorized'}
                  />
                ) : (
                  <Link to={`/blogs/${blog._id}`}>
                    <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-indigo-200">
                      <div className="md:flex">
                        <div className="md:w-1/3 relative overflow-hidden">
                          <img
                            src={blog.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=600'}
                            alt={blog.title || 'Blog post'}
                            className="w-full h-48 md:h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/95 backdrop-blur-sm text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              {blog.category || 'Uncategorized'}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                downloadBlogAsPDF(blog);
                              }}
                              disabled={downloadingId === blog._id}
                              className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 disabled:opacity-50 hover:scale-110"
                            >
                              {downloadingId === blog._id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <Download className="w-4 h-4 text-gray-700" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="md:w-2/3 p-6 flex flex-col justify-center">
                          <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                            <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                              <User className="w-3 h-3 mr-1" />
                              {blog.author?.name || 'Unknown Author'}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {blog.views && (
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {blog.views.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
                            {blog.title || 'Untitled'}
                          </h3>

                          <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                            {blog.excerpt || 'No excerpt available'}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
                              Read More
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                              <span className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                {Math.floor(Math.random() * 50) + 5}
                              </span>
                              <span className="flex items-center">
                                <Bookmark className="w-4 h-4 mr-1" />
                                {Math.floor(Math.random() * 20) + 2}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No stories found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedCategory !== 'All' && selectedMonth
                ? `No blog posts found in "${selectedCategory}" category for ${selectedMonth} ${selectedYear}.`
                : selectedCategory !== 'All'
                  ? `No blog posts found in "${selectedCategory}" category.`
                  : selectedMonth
                    ? `No blog posts were published in ${selectedMonth} ${selectedYear}.`
                    : searchTerm
                      ? `No stories match your search for "${searchTerm}".`
                      : 'No blog posts available.'
              }
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 group"
          >
            <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}