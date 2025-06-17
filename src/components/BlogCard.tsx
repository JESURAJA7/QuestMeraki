import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
}

export default function BlogCard({
  id,
  title,
  excerpt,
  author,
  date,
  imageUrl,
  category,
}: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
      <Link to={`/blogs/${id}`} className="block">
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
      </Link>
      <div className="p-6">
        <Link
          to={`/category/${category.toLowerCase()}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
        >
          {category}
        </Link>
        <Link to={`/blogs/${id}`}>
          <h2 className="mt-2 text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {title}
          </h2>
        </Link>
        <p className="mt-3 text-gray-600 line-clamp-3 text-sm leading-relaxed">{excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span className="font-medium">{author}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </article>
  );
}