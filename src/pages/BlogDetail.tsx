import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
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
          views: data.views || Math.floor(Math.random() * 5000) + 100,
          likes: data.likes || Math.floor(Math.random() * 200) + 10,
          author: {
            ...data.author,
            avatar: data.author.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
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
  const downloadBlogAsPDF = async (blog: Post) => {
    setDownloadingId(blog._id);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // ===== COVER PAGE =====
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(30, 30, 100);
      pdf.text(blog.title, pageWidth / 2, pageHeight / 3, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`By ${blog.author.name}`, pageWidth / 2, pageHeight / 3 + 20, { align: 'center' });

      pdf.text(
        new Date(blog.createdAt).toLocaleDateString('en-US', {
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

      // ===== HEADER =====
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

      // ===== TITLE BLOCK =====
      pdf.setFillColor(30, 30, 100);
      pdf.rect(margin, yPosition - 10, pageWidth - 2 * margin, 20, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(blog.title, pageWidth / 2, yPosition + 3, { align: 'center' });

      yPosition += 25;

      // ===== METADATA =====
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);

      const authorText = `👤 ${blog.author.name}`;
      const categoryText = `🏷️ ${blog.category}`;
      const dateText = `📅 ${new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`;

      const metadataSpacing = (pageWidth - 2 * margin) / 3;

      pdf.text(authorText, margin, yPosition);
      pdf.text(categoryText, margin + metadataSpacing, yPosition);
      pdf.text(dateText, margin + metadataSpacing * 2, yPosition);

      yPosition += 20;

      // ===== DIVIDER =====
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;

      // ===== TEXT HELPER =====
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
        yPosition += spaceNeeded + fontSize * 0.5; // Dynamic spacing
      };

      // ===== CLEAN HTML & PARSE PARAGRAPHS =====
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = blog.content;

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

      // ===== RENDER PARAGRAPHS =====
      for (const para of paragraphs) {
        const isQuote = para.startsWith('"') || para.startsWith('"');
        const style: { fontSize: number; isBold: boolean; color: [number, number, number] } = isQuote
          ? { fontSize: 11, isBold: true, color: [100, 50, 150] }
          : { fontSize: 11, isBold: false, color: [60, 60, 60] };
        addText(para, style.fontSize, style.isBold, style.color);
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
        pdf.text(`QuestMeraki`, margin, pageHeight - 8);
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
          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12">
              <article className="mb-12">
                <div
                  className="prose prose-lg prose-indigo max-w-none custom-article-style
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-p:text-gray-700 prose-p:mb-6
                    prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
                    prose-ul:space-y-2 prose-ol:space-y-2
                    prose-li:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </article>
            </div>
          </div>
          {/* save Pdf */}
          <div className="flex justify-end mb-4 mt-5">
            <button
              onClick={() => downloadBlogAsPDF(post)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>



          {/* Tags */}
          {/* {post.tags && post.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )} */}

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
                {/* <p className="text-gray-600 mb-4">
                  Passionate writer and developer sharing insights about modern web development, 
                  design patterns, and technology trends. Always learning and exploring new ways 
                  to create better user experiences.
                </p> */}
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Follow Author
                </button>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {/* <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="group cursor-pointer">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group-hover:border-indigo-200">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full">
                          {relatedPost.category}
                        </span>
                        <span className="text-gray-500 text-sm">{relatedPost.readTime}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section> */}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;


