import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

interface FeaturedPostProps {
  id: string;
  title: string;
  subtitle: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
}

export default function FeaturedPost({
  id,
  title,
  subtitle,
  excerpt,
  author,
  date,
  imageUrl,
  category,
}: FeaturedPostProps) {
  return (
    <article className="relative bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/2">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>
        <div className="md:w-1/2 p-8">
          <Link
            to={`/category/${category.toLowerCase()}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {category}
          </Link>
          <Link to={`/post/${id}`}>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 hover:text-indigo-600">
              {title}
            </h2>
          </Link>
          <p className="mt-2 text-gray-700">{subtitle}</p>
          <p className="mt-4 text-lg text-gray-600">{excerpt}</p>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">{author}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-gray-600">{date}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}