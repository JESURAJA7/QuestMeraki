import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, Download, Eye, Edit, Trash2, Calendar, User, FileText, Plus } from 'lucide-react';
import jsPDF from 'jspdf';

const API_URL = import.meta.env.VITE_API_URL;

interface Blog {
  _id: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  category: string;
  author: {
    name: string;
    email: string;
  };
  imageUrl?: string;
}

export default function MyBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/blogs/user/post`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
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

    fetchBlogs();
  }, []);

  const downloadAsPDF = async (blog: Blog) => {
    setDownloadingId(blog._id);
    try {
      // Create new jsPDF instance
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.5 + 5;
      };

      // Add title
      addText(blog.title, 20, true);
      yPosition += 10;

      // Add metadata
      addText(`Author: ${blog.author.name}`, 12);
      addText(`Category: ${blog.category}`, 12);
      addText(`Status: ${blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}`, 12);
      addText(`Created: ${new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 12);
      yPosition += 15;

      // Add a separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Process content - remove HTML tags and format
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = blog.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Split content into paragraphs
      const paragraphs = textContent.split('\n').filter(p => p.trim().length > 0);
      
      paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
          addText(paragraph.trim(), 11);
          yPosition += 5; // Add space between paragraphs
        }
      });

      // Add footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Generated from QuestMeraki - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `${blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return '✓';
      case 'rejected':
        return '✗';
      case 'pending':
        return '⏳';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Animated Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-yellow-300/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-pink-300/20 rounded-full animate-ping"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 mr-4 animate-pulse" />
              <h1 className="text-5xl font-bold">
                My <span className="text-yellow-300">Stories</span>
              </h1>
            </div>
            <p className="text-xl opacity-90 mb-8">
              Manage your creative journey with <span className="font-bold text-yellow-300">QuestMeraki</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{blogs.length}</div>
                <div className="text-sm opacity-80">Total Stories</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{blogs.filter(b => b.status === 'published').length}</div>
                <div className="text-sm opacity-80">Published</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{blogs.filter(b => b.status === 'pending').length}</div>
                <div className="text-sm opacity-80">Pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-10">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Blogs</h2>
           
          </div>
          <Link
            to="/create-blog"
            className="mt-4 sm:mt-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Story
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-xl shadow-md">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Journey</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You haven't created any stories yet. Begin your creative journey and share your unique perspective with the world.
              </p>
              <Link
                to="/create-blog"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Story
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 group">
                {/* Card Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={blog.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(blog.status)}`}>
                      <span className="mr-1">{getStatusIcon(blog.status)}</span>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </span>
                  </div>

                  {/* Download Button */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => downloadAsPDF(blog)}
                      disabled={downloadingId === blog._id}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                      title="Download as PDF"
                    >
                      {downloadingId === blog._id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Download className="w-4 h-4 text-gray-700" />
                      )}
                    </button>
                  </div>

                  {/* Category Tag */}
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {blog.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                    {blog.title}
                  </h3>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{blog.author.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {blog.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/post/${blog._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      
                      {blog.status !== 'published' && (
                        <Link
                          to={`/edit-blog/${blog._id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}