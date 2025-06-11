import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeaturedPost from '../components/FeaturedPost';

const API_URL = import.meta.env.VITE_API_URL;
//console.log('API_URL:', API_URL);
type Post = {
  _id: string;
  title: string;
  subtitle: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  imageUrl: string;
  category: string;
};

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

   const featuredPost = {
    id: '1',
    title: 'The Future of Web Development: What to Expect in 2025',
    excerpt: 'Discover the upcoming trends and technologies that will shape the future of web development. From AI-powered development tools to new frameworks and methodologies.',
    author: 'John Doe',
    date: 'March 1, 2024',
    imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
    category: 'Technology',
  };

  
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        console.log(recentPosts);
        setIsLoading(true);
        const response = await fetch(`${API_URL}/blogs`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setRecentPosts(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
        setError('Failed to fetch recent posts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  // Convert HTML string to plain text
  const htmlToText = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
       <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Post</h2>
        <FeaturedPost subtitle={''} {...featuredPost} />
      </section>
      {/* Recent Posts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : recentPosts.length === 0 ? (
          <p>No recent posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)] transform transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-4">
                  <p className="text-sm text-indigo-600 font-semibold">{post.category}</p>
                  <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-600">{post.subtitle}</p>
                  <p className="mt-2 text-gray-700 text-sm line-clamp-3">
                    {htmlToText(post.content).substring(0, 90)}...
                  </p>
                  <Link
                    to={`/blogs/${post._id}`}
                    className="inline-block mt-4 text-indigo-600 hover:underline text-sm font-medium"
                  >
                    Read more →
                  </Link>
                  <div className="text-xs text-gray-500 mt-2">
                    By {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
