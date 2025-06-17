import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const API_URL = import.meta.env.VITE_API_URL;

type Post = {
  _id: string;
  title: string;
  subtitle?: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  imageUrl: string;
  category: string;
};

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/u/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch blog post');
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError('Could not load blog post');
        console.error(err);
      }
    };

    fetchPost();
  }, [id]);

  // Format content to convert newlines and tabs to HTML
  // const formatContent = (raw: string) =>
  //   raw
  //     .replace(/\\&/g, '&amp;') // escape &
  //     .replace(/</g, '&lt;')  // escape <
  //     .replace(/>/g, '&gt;')  // escape >
  //     .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;') // convert tabs
  //     .replace(/\\n/g, '<br/>'); // convert newlines
 
  if (error) return <p className="text-red-500">{error}</p>;
  if (!post) return <p>Loading...</p>;
//console.log('Raw content:', JSON.stringify(post.content));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <img
        src={post.imageUrl}
        alt={post.title}
        className="w-full h-96 object-cover rounded-lg mb-6"
      />
      <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{post.title}</h1>
      {post.subtitle && <h2 className="text-xl text-gray-600 mb-4">{post.subtitle}</h2>}
      <p className="text-sm text-gray-500 mb-4">By {post.author.name}</p>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
        
      />
    </div>
    
  );
}
