import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  Eye,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  FileDown,
  Copy,
  Check
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

type Post = {
  _id: string;
  title: string;
  subtitle?: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  imageUrl: string;
  category: string;
  readTime?: string;
  tags?: string[];
  views?: number;
  likes?: number;
};

const BlogDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/blogs/u/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch blog post');
        const data = await res.json();

        // Add mock data for better UX
        const enhancedPost = {
          ...data,
          readTime: data.readTime || '8 min read',
          tags: data.tags || ['React', 'TypeScript', 'Web Development'],
          views: data.views || 0,
          likes: data.likes || Math.floor(Math.random() * 200) + 10,
          author: {
            ...data.author,
            avatar: data.author.avatar || 'https://res.cloudinary.com/dczicfhcv/image/upload/v1752469451/person_hvkhav.png'
          }
        };

        setPost(enhancedPost);
      } catch (err) {
        setError('Could not load blog post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Clean HTML content for better display
  const cleanContent = (htmlContent: string) => {
    // First, clean up unwanted characters from the raw HTML
    let cleanedHtml = htmlContent
      // Remove carriage returns, line feeds, and tabs
      .replace(/\r\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/\t/g, ' ')
      // Remove multiple spaces and normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedHtml;

    // Remove unwanted elements
    const unwantedElements = tempDiv.querySelectorAll('script, style');
    unwantedElements.forEach(el => el.remove());

    // Clean up text content in all text nodes
    const cleanTextNodes = (element: Element) => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node as Text);
      }

      textNodes.forEach(textNode => {
        if (textNode.textContent) {
          textNode.textContent = textNode.textContent
            .replace(/\r\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      });
    };

    // Clean text nodes
    cleanTextNodes(tempDiv);

    // Fix image sources to be absolute URLs
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // If it's a relative URL, make it absolute
        if (src.startsWith('/')) {
          img.setAttribute('src', `http://questmeraki.com${src}`);
        } else {
          img.setAttribute('src', `http://questmeraki.com/${src}`);
        }
      }
      // Add responsive classes
      img.className = 'max-w-full h-auto rounded-lg shadow-md my-4';
    });

    // Style headings
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      heading.className = 'font-bold text-gray-900 mt-8 mb-4';
      if (heading.tagName === 'H4') {
        heading.className += ' text-xl';
      } else if (heading.tagName === 'H6') {
        heading.className += ' text-lg text-indigo-600';
      }
    });

    // Style lists
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.className = 'space-y-2 my-4';
      const listItems = list.querySelectorAll('li');
      listItems.forEach(li => {
        li.className = 'text-gray-700 leading-relaxed';
      });
    });

    // Style links
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      link.className = 'text-indigo-600 hover:text-indigo-800 underline';
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // Style paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      if (p.textContent?.trim()) {
        p.className = 'text-gray-700 leading-relaxed mb-4';
      }
    });

    return tempDiv.innerHTML;
  };

  const downloadBlogAsPDF = async (blog: Post) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/blogs')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Articles</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Facebook className="w-4 h-4 text-blue-600" />
                      <span>Share on Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <span>Share on Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-blue-700" />
                      <span>Share on LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blogs" className="hover:text-indigo-600 transition-colors">Blogs</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{post.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full">
                {post.category}
              </span>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {post.views?.toLocaleString()} views
                </span>
              </div>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {post.subtitle && (
              <h2 className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.subtitle}
              </h2>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between py-6 border-t border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likes} likes
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  12 comments
                </span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-8">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200 mb-8">
            <article className="prose prose-lg max-w-none custom-article-style">
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(cleanContent(post.content))
                }}
              />
            </article>
          </div>

          {/* Download PDF Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => downloadBlogAsPDF(post)}
              disabled={downloadingId === post._id}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileDown className="w-5 h-5" />
              <span>{downloadingId === post._id ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>

          {/* Author Bio */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-12">
            <div className="flex items-start space-x-6">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.author.name}</h3>
              
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Follow Author
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: bold;
          color: #1f2937;
        }

        .blog-content h4 {
          font-size: 1.25rem;
          color: #4f46e5;
        }

        .blog-content h6 {
          font-size: 1.125rem;
          color: #6366f1;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .blog-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #374151;
        }

        .blog-content ul,
        .blog-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: #374151;
        }

        .blog-content strong {
          font-weight: 600;
          color: #1f2937;
        }

        .blog-content em {
          font-style: italic;
          color: #6b7280;
        }

        .blog-content a {
          color: #4f46e5;
          text-decoration: underline;
        }

        .blog-content a:hover {
          color: #3730a3;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default BlogDetail;