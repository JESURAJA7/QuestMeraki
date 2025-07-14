import { useState, useEffect } from 'react';
import { Download, ArrowRight, Clock, User, TrendingUp, BookOpen, Star, Eye, Heart, Bookmark, Share2, ChevronRight, Sparkles, Calendar, Tag, ChevronLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';
import DownloadModal, { UserDownloadData } from '../components/DownloadModal';

const API_URL = import.meta.env.VITE_API_URL;

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
  growthRate?: number;
}

interface TrendingBlog extends Blog {
  views: number;
  growthRate: number;
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<TrendingBlog[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Pagination settings
  const BLOGS_PER_PAGE = 6;
  const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [blogsResponse, trendingResponse, popularResponse] = await Promise.all([
        fetch(`${API_URL}/blogs`),
        fetch(`${API_URL}/blogs/trending?limit=4`),
        fetch(`${API_URL}/blogs/popular?limit=5`)
      ]);

      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        setBlogs(blogsData);
      }

      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingBlogs(trendingData);
      }

      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        setPopularBlogs(popularData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = async (blogId: string) => {
    try {
      await fetch(`${API_URL}/blogs/${blogId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleDownloadClick = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowDownloadModal(true);
  };

  const handleDownloadSubmit = async (userData: UserDownloadData) => {
    console.log('Download data:', userData);
    if (!selectedBlog) return;

    setDownloadingId(selectedBlog._id);

    try {
      // Store download data in database
      await fetch(`${API_URL}/blogs/downloads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          downloadedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      // Generate and download PDF
      await downloadBlogAsPDF(selectedBlog);

      // Close modal
      setShowDownloadModal(false);
      setSelectedBlog(null);
    } catch (error) {
      console.error('Failed to process download:', error);
      setError('Failed to process download. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadBlogAsPDF = async (blog: Blog) => {
     setDownloadingId(blog._id);
     try {
       const pdf = new jsPDF();
       const pageWidth = pdf.internal.pageSize.getWidth();
       const pageHeight = pdf.internal.pageSize.getHeight();
       const margin = 20;
       let yPosition = margin;
 
       // Helper function to add text with proper spacing
       const addText = (
         text: string,
         fontSize: number,
         isBold = false,
         color: [number, number, number] = [0, 0, 0],
         spacing = 5
       ) => {
         if (!text.trim()) return;
 
         // Clean the text for PDF
         const cleanText = text
           .replace(/\r\n/g, ' ')
           .replace(/\r/g, ' ')
           .replace(/\n/g, ' ')
           .replace(/\t/g, ' ')
           .replace(/\s+/g, ' ')
           .trim();
 
         pdf.setFontSize(fontSize);
         pdf.setTextColor(...color);
         pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
 
         const lines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin);
         const lineHeight = fontSize * 0.4; // Reduced line height multiplier
         const totalHeight = lines.length * lineHeight;
 
         // Check if we need a new page
         if (yPosition + totalHeight > pageHeight - margin) {
           pdf.addPage();
           yPosition = margin;
         }
 
         // Add the text
         lines.forEach((line: string, index: number) => {
           pdf.text(line, margin, yPosition + (index * lineHeight));
         });
 
         yPosition += totalHeight + spacing; // Add controlled spacing
       };
 
       // ===== COVER PAGE =====
       pdf.setFont('helvetica', 'bold');
       pdf.setFontSize(24);
       pdf.setTextColor(30, 30, 100);
       
       // Split title if too long
       const titleLines = pdf.splitTextToSize(blog.title, pageWidth - 2 * margin);
       const titleStartY = pageHeight / 3;
       titleLines.forEach((line: string, index: number) => {
         pdf.text(line, pageWidth / 2, titleStartY + (index * 10), { align: 'center' });
       });
 
       pdf.setFont('helvetica', 'normal');
       pdf.setFontSize(14);
       pdf.setTextColor(80, 80, 80);
       pdf.text(`By ${blog.author.name}`, pageWidth / 2, titleStartY + (titleLines.length * 10) + 15, { align: 'center' });
       pdf.text(
         new Date(blog.createdAt).toLocaleDateString('en-US', {
           year: 'numeric',
           month: 'long',
           day: 'numeric',
         }),
         pageWidth / 2,
         titleStartY + (titleLines.length * 10) + 30,
         { align: 'center' }
       );
 
       pdf.addPage();
       yPosition = margin;
 
       // ===== HEADER =====
       pdf.setFillColor(240, 240, 240);
       pdf.rect(0, 0, pageWidth, 30, 'F');
 
       pdf.setFont('helvetica', 'bold');
       pdf.setFontSize(16);
       pdf.setTextColor(50, 50, 150);
       pdf.text('QuestMeraki', margin, 20);
 
       pdf.setFont('helvetica', 'normal');
       pdf.setFontSize(8);
       pdf.setTextColor(100, 100, 100);
       pdf.text('Premium Blog Content', pageWidth - margin, 20, { align: 'right' });
 
       yPosition = 45;
 
       // ===== TITLE =====
       addText(blog.title, 18, true, [30, 30, 100], 10);
 
       // ===== METADATA =====
       const metadata = `Author: ${blog.author.name} | Category: ${blog.category} | Date: ${new Date(blog.createdAt).toLocaleDateString()}`;
       addText(metadata, 10, false, [100, 100, 100], 15);
 
       // ===== DIVIDER =====
       pdf.setDrawColor(200, 200, 200);
       pdf.setLineWidth(0.5);
       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
       yPosition += 15;
 
       // ===== CONTENT PROCESSING =====
       const tempDiv = document.createElement('div');
       tempDiv.innerHTML = blog.content;
 
       // Remove unwanted elements
       const unwantedElements = tempDiv.querySelectorAll('script, style, img');
       unwantedElements.forEach(el => el.remove());
 
       // Extract text content with structure
       const processElement = (element: Element): void => {
         const tagName = element.tagName?.toLowerCase();
         const text = element.textContent?.trim() || '';
 
         if (!text) return;
 
         switch (tagName) {
           case 'h1':
           case 'h2':
           case 'h3':
           case 'h4':
             addText(text, 14, true, [50, 50, 150], 8);
             break;
           case 'h5':
           case 'h6':
             addText(text, 12, true, [100, 50, 150], 6);
             break;
           case 'p':
             if (text.length > 0) {
               addText(text, 10, false, [60, 60, 60], 6);
             }
             break;
           case 'li':
             addText(`• ${text}`, 10, false, [60, 60, 60], 4);
             break;
           case 'strong':
           case 'b':
             addText(text, 10, true, [40, 40, 40], 4);
             break;
           default:
             if (text.length > 20) { // Only add substantial text content
               addText(text, 10, false, [60, 60, 60], 5);
             }
         }
       };
 
       // Process all elements
       const allElements = tempDiv.querySelectorAll('*');
       const processedTexts = new Set<string>();
 
       allElements.forEach(element => {
         const text = element.textContent?.trim() || '';
         // Avoid duplicate content and clean special characters
         const cleanText = text
           .replace(/\r\n/g, ' ')
           .replace(/\r/g, ' ')
           .replace(/\n/g, ' ')
           .replace(/\t/g, ' ')
           .replace(/\s+/g, ' ')
           .trim();
         
         if (cleanText && cleanText.length > 10 && !processedTexts.has(cleanText)) {
           processedTexts.add(cleanText);
           processElement(element);
         }
       });
 
       // If no structured content found, process as plain text
       if (processedTexts.size === 0) {
         const plainText = tempDiv.textContent || '';
         const cleanPlainText = plainText
           .replace(/\r\n/g, ' ')
           .replace(/\r/g, ' ')
           .replace(/\n/g, ' ')
           .replace(/\t/g, ' ')
           .replace(/\s+/g, ' ')
           .trim();
         
         const paragraphs = cleanPlainText
           .split(/\s{2,}/)
           .map(p => p.trim())
           .filter(p => p.length > 0);
 
         paragraphs.forEach(paragraph => {
           addText(paragraph, 10, false, [60, 60, 60], 6);
         });
       }
 
       // ===== FOOTER ON ALL PAGES =====
       const totalPages = pdf.getNumberOfPages();
       for (let i = 1; i <= totalPages; i++) {
         pdf.setPage(i);
         pdf.setDrawColor(220, 220, 220);
         pdf.setLineWidth(0.5);
         pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
 
         pdf.setFontSize(8);
         pdf.setTextColor(100, 100, 100);
         pdf.text('QuestMeraki', margin, pageHeight - 8);
         pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
       }
 
       // ===== SAVE FILE =====
       const fileName = `${blog.title
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

  // Get current page blogs
  const getCurrentPageBlogs = () => {
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    return blogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const featuredPost = blogs[0];
  const currentPageBlogs = getCurrentPageBlogs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 mt-5">
      {/* Animated Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/5 to-blue-600/10 animate-pulse"></div>

          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute top-32 right-1/3 w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-transparent rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-blue-600/10 to-transparent rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
          </div>

          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-purple-500 rounded-full opacity-30 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6 overflow-hidden">
              <h1 className="text-5xl md:text-7xl font-bold animate-fade-in-up">
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                  Quest
                </span>
                <span className="text-gray-900 ml-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Meraki
                </span>
              </h1>
            </div>

            <div className="mb-8 overflow-hidden">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Where curiosity meets creativity. Discover stories, insights, and ideas that inspire your journey of continuous learning and growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button className="group border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
                <Link to="/about" className="relative z-10">
                  <span className="relative z-10">About us</span>
                </Link>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
              {/* <Link
                to="/admin/downloads"
                className="group border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
              >
                <span className="relative z-10">Admin Dashboard</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Link> */}
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="text-center group">
                <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
                  {blogs.length}+
                </div>
                <div className="text-gray-600 mt-1">Stories Published</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  {blogs.reduce((total, blog) => total + (blog.views || 0), 0).toLocaleString()}+
                </div>
                <div className="text-gray-600 mt-1">Total Views</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-pink-600 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <div className="text-gray-600 mt-1">Fresh Content</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16 mt-16">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-gray-900 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                Featured Story
              </h2>
            </div>

            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-700 border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/2 relative overflow-hidden">
                  <img
                    src={featuredPost.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {featuredPost.category}
                    </span>
                  </div>
                  <div className="absolute top-6 right-6 flex space-x-2">
                    <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-110 group">
                      <Heart className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition-colors" />
                    </button>
                    <button className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 hover:scale-110 group">
                      <Bookmark className="w-5 h-5 text-gray-700 group-hover:text-blue-500 transition-colors" />
                    </button>
                    <button
                      onClick={() => handleDownloadClick(featuredPost)}
                      disabled={downloadingId === featuredPost._id}
                      className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-110"
                      title="Download as PDF"
                    >
                      {downloadingId === featuredPost._id ? (
                        <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Download className="w-5 h-5 text-gray-700" />
                      )}
                    </button>
                  </div>
                  {featuredPost.views && (
                    <div className="absolute bottom-6 left-6">
                      <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {featuredPost.views.toLocaleString()} views
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center text-sm text-gray-500 mb-6 space-x-6">
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <User className="w-4 h-4 mr-2" />
                      {featuredPost.author.name}
                    </span>
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(featuredPost.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {featuredPost.title}
                  </h3>

                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {featuredPost.excerpt}
                  </p>

                  <Link
                    to={`/blogs/${featuredPost._id}`}
                    onClick={() => handleBlogClick(featuredPost._id)}
                    className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                  >
                    Read Full Story
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Stories with Pagination */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                Latest Stories
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Link
                  to="/blogs"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold transition-colors group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentPageBlogs.map((post, index) => (
                <Link
                  to={`/blogs/${post._id}`}
                  key={post._id}
                  onClick={() => handleBlogClick(post._id)}
                >
                  <article
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-gray-100 hover:border-indigo-200 transform hover:-translate-y-2"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={post.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=600'}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur-sm text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {post.category}
                        </span>
                      </div>

                      {post.views && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {post.views.toLocaleString()}
                          </div>
                        </div>
                      )}

                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 group/btn"
                        >
                          <Heart className="w-4 h-4 text-gray-700 group-hover/btn:text-red-500 transition-colors" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 hover:scale-110 group/btn"
                        >
                          <Share2 className="w-4 h-4 text-gray-700 group-hover/btn:text-blue-500 transition-colors" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDownloadClick(post);
                          }}
                          disabled={downloadingId === post._id}
                          className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 disabled:opacity-50 hover:scale-110"
                          title="Download as PDF"
                        >
                          {downloadingId === post._id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Download className="w-4 h-4 text-gray-700" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                        <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                          <User className="w-3 h-3 mr-1" />
                          {post.author.name}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="flex items-center space-x-3 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {post.views?.toLocaleString() || '0'}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {Math.floor(Math.random() * 50) + 5}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link
                to="/blogs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explore All Stories
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Popular Posts */}
              {popularBlogs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    Popular Posts
                  </h3>
                  <div className="space-y-4">
                    {popularBlogs.map((post, index) => (
                      <Link
                        to={`/blogs/${post._id}`}
                        key={post._id}
                        onClick={() => handleBlogClick(post._id)}
                      >
                        <div className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-all duration-200 hover:shadow-md">
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={post.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=100'}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                              {post.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 space-x-3">
                              <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                <Eye className="w-3 h-3 mr-1" />
                                {post.views?.toLocaleString() || '0'}
                              </span>
                              <span>
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Posts */}
              {trendingBlogs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    Trending Now
                  </h3>
                  <div className="space-y-4">
                    {trendingBlogs.map((post, index) => (
                      <Link
                        to={`/blogs/${post._id}`}
                        key={post._id}
                        onClick={() => handleBlogClick(post._id)}
                      >
                        <div className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 rounded-xl p-3 transition-all duration-200 hover:shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
                              {post.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="flex items-center">
                                  <Eye className="w-3 h-3 mr-1" />
                                  {post.views.toLocaleString()}
                                </span>
                                <span className="flex items-center text-green-600">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  +{post.growthRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-700 opacity-0 hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Stay Updated
                  </h3>
                  <p className="text-indigo-100 mb-4 text-sm">
                    Get the latest stories and insights delivered straight to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 shadow-inner"
                    />
                    <button className="w-full bg-white text-indigo-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
                      Subscribe
                    </button>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {blogs.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <BookOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Stories Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on bringing you amazing content. Check back soon for inspiring stories and insights.
            </p>
          </div>
        )}
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => {
          setShowDownloadModal(false);
          setSelectedBlog(null);
        }}
        onDownload={handleDownloadSubmit}
        blogTitle={selectedBlog?.title || '' }
        blogId={selectedBlog?._id || ''}
        isDownloading={downloadingId !== null}
      />

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}