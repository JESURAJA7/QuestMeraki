import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

interface BlogCardProps {
  _id: string;
  title: string;
  subtitle?: string;
  content: string; // now from HTML
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  imageUrl: string;
  category: string;
}

// Utility: Strip HTML tags from content
const htmlToText = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

export default function BlogCard({
  _id,
  title,
  content,
  author,
  createdAt,
  imageUrl,
  category,
}: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
      <Link to={`/blogs/${_id}`}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-6">
        <Link
          to={`/category/${category.toLowerCase()}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {category}
        </Link>
        <Link to={`/blogs/${_id}`}>
          <h2 className="mt-2 text-xl font-semibold text-gray-900 hover:text-indigo-600">
            {title}
          </h2>
        </Link>
        <p className="mt-3 text-gray-600 line-clamp-3">
          {htmlToText(content).substring(0, 150)}...
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>{author.name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
