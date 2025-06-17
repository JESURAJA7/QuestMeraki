import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

interface FeaturedPostProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  category: string;
}

export default function FeaturedPost({
  id,
  title,
  excerpt,
  author,
  date,
  imageUrl,
  category,
}: FeaturedPostProps) {
  return (
    <article className="relative bg-white rounded-xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-xl">
      <div className="md:flex">
        <div className="md:w-1/2">
          <Link to={`/post/${id}`} className="block h-full">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <Link
            to={`/category/${category.toLowerCase()}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 mb-2"
          >
            {category}
          </Link>
          <Link to={`/post/${id}`}>
            <h2 className="text-3xl font-bold text-gray-900 hover:text-indigo-600 transition-colors duration-200 mb-4 leading-tight">
              {title}
            </h2>
          </Link>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">{excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600 font-medium">{author}</span>
              </div>
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