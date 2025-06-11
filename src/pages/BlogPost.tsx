import { useParams } from 'react-router-dom';
import { Clock, User, Tag } from 'lucide-react';

export default function BlogPost() {
  const { id } = useParams();

  // Temporary mock data
  const post = {
    title: 'The Future of Web Development: What to Expect in 2025',
    content: `
      <p>The landscape of web development is constantly evolving, and as we look ahead to 2025, several exciting trends and technologies are set to reshape how we build and interact with web applications.</p>

      <h2>AI-Powered Development Tools</h2>
      <p>Artificial Intelligence is revolutionizing the way developers work. From intelligent code completion to automated testing and debugging, AI tools are becoming an integral part of the development workflow.</p>

      <h2>Web Assembly and the Future of Performance</h2>
      <p>Web Assembly continues to gain traction, enabling high-performance applications to run directly in the browser. This technology opens new possibilities for complex web applications that previously required native implementations.</p>

      <h2>The Rise of Edge Computing</h2>
      <p>Edge computing is becoming increasingly important in web development, allowing for faster response times and reduced server loads by processing data closer to where it's needed.</p>
    `,
    author: 'John Doe',
    date: 'March 1, 2024',
    imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
    category: 'Technology',
    tags: ['Web Development', 'Technology', 'Future Trends', 'AI']
  };

  return (
    <article className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span>{post.category}</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto mb-12">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-[400px] object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-12 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}