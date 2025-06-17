import { useState, useEffect } from 'react';
import { Download, ArrowRight, Clock, User, TrendingUp, BookOpen, Star, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';

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
}

export default function Home() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

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

  const downloadBlogAsPDF = async (blog: Blog) => {
    setDownloadingId(blog._id);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.5 + 5;
      };

      addText(blog.title, 20, true);
      yPosition += 10;

      addText(`Author: ${blog.author.name}`, 12);
      addText(`Category: ${blog.category}`, 12);
      addText(`Published: ${new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 12);
      yPosition += 15;

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = blog.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      const paragraphs = textContent.split('\n').filter(p => p.trim().length > 0);
      
      paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
          addText(paragraph.trim(), 11);
          yPosition += 5;
        }
      });

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Downloaded from QuestMeraki - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const fileName = `${blog.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredPost = blogs[0];
  const recentPosts = blogs.slice(1, 7);
  const popularPosts = blogs.slice(3, 8); // Different set for popular posts

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Animated Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/5 to-blue-600/10 animate-pulse"></div>
          
          {/* Floating Circles */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-16 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute top-32 right-1/3 w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
          
          {/* Moving Gradient Waves */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-600/10 to-transparent rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-l from-blue-600/10 to-transparent rounded-full animate-spin" style={{animationDuration: '25s', animationDirection: 'reverse'}}></div>
          </div>

          {/* Animated Particles */}
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
            {/* Animated Title */}
            <div className="mb-6 overflow-hidden">
              <h1 className="text-5xl md:text-7xl font-bold animate-fade-in-up">
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
                  Quest
                </span>
                <span className="text-gray-900 ml-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                  Meraki
                </span>
              </h1>
            </div>
            
            {/* Animated Subtitle */}
            <div className="mb-8 overflow-hidden">
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                Where curiosity meets creativity. Discover stories, insights, and ideas that inspire your journey of continuous learning and growth.
              </p>
            </div>
            
            {/* Animated Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              {/* <button className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                <span className="relative z-10">Start Reading</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button> */}
              <button className="group border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
                <Link to="/about" className="relative z-10">
                <span className="relative z-10">About us</span>
                </Link>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </div>

            {/* Animated Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="text-center group">
                <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
                  {blogs.length}+
                </div>
                <div className="text-gray-600 mt-1">Stories Published</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  10K+
                </div>
                <div className="text-gray-600 mt-1">Happy Readers</div>
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

      <div className="container mx-auto px-4 pb-16">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                New Story
              </h2>
            </div>
            
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="md:flex">
                <div className="md:w-1/2 relative overflow-hidden">
                  <img 
                    src={featuredPost.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                      {featuredPost.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => downloadBlogAsPDF(featuredPost)}
                      disabled={downloadingId === featuredPost._id}
                      className="bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:scale-110"
                      title="Download as PDF"
                    >
                      {downloadingId === featuredPost._id ? (
                        <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Download className="w-5 h-5 text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {featuredPost.author.name}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(featuredPost.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  
                  <button className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-colors group">
                    <Link to={`/blogs/${featuredPost._id}`}>
                      Read Full Story
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Stories</h2>
            <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              {recentPosts.map((post) => (
                <Link to={`/blogs/${post._id}`} className="lg:col-span-3" key={post._id}>
                  <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="md:flex">
                      <div className="md:w-1/3 relative overflow-hidden">
                        <img 
                          src={post.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 backdrop-blur-sm text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => downloadBlogAsPDF(post)}
                            disabled={downloadingId === post._id}
                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300 disabled:opacity-50 hover:scale-110"
                            title="Download as PDF"
                          >
                            {downloadingId === post._id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                            ) : (
                              <Download className="w-4 h-4 text-gray-700" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                          <span className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {post.author.name}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        
                        <button className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors group">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Popular Posts */}
              {popularPosts.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star className="w-5 h-5 text-purple-600 mr-2" />
                    Popular Posts
                  </h3>
                  <div className="space-y-4">
                    {popularPosts.map((post, index) => (
                      <div key={post._id} className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={post.imageUrl || 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=100'} 
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-1">
                            {post.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <span className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              {Math.floor(Math.random() * 1000) + 100}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Posts */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                  Trending Now
                </h3>
                <div className="space-y-4">
                  {blogs.slice(0, 4).map((post, index) => (
                    <div key={post._id} className="flex items-start space-x-3 group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3">Stay Updated</h3>
                  <p className="text-purple-100 mb-4 text-sm">
                    Get the latest stories and insights delivered straight to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
                    />
                    <button className="w-full bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105 duration-200">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {blogs.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Stories Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We're working on bringing you amazing content. Check back soon for inspiring stories and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}