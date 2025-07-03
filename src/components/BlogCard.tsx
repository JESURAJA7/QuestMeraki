import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link for client-side navigation

interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl?: string;
  category: string;
  loading?: 'eager' | 'lazy';
}

const CategoryColors = {
  'palms of his hands': 'bg-blue-100 text-blue-800 border-blue-200',
  'perspective': 'bg-green-100 text-green-800 border-green-200',
  'questionnaires': 'bg-purple-100 text-purple-800 border-purple-200',
  'ideating zone': 'bg-orange-100 text-orange-800 border-orange-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
} as const;

const getCategoryColor = (category: string): string => {
  if (!category) return CategoryColors.default;
  
  const normalizedCategory = category.toLowerCase();
  return CategoryColors[normalizedCategory as keyof typeof CategoryColors] || CategoryColors.default;
};

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

export default function BlogCard({ 
  id, 
  title = 'Untitled', 
  excerpt = 'No excerpt available', 
  author = 'Unknown Author', 
  date = 'No date', 
  imageUrl, 
  category = 'Uncategorized',
  loading = 'lazy'
}: BlogCardProps) {
  const readingTime = Math.max(1, Math.ceil(excerpt.split(' ').length / 200));
  
  return (
    <article 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
      aria-labelledby={`blog-title-${id}`}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden h-48">
        <img
          src={imageUrl || DEFAULT_IMAGE}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading={loading}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_IMAGE;
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
          // aria-hidden="true"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm
            ${getCategoryColor(category)}
          `}>
            {category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 
          id={`blog-title-${id}`}
          className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200"
        >
          <Link 
            to={`/blogs/${id}`} 
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
          >
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center" aria-label={`Author: ${author}`}>
              <User className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>{author}</span>
            </div>
            <div className="flex items-center" aria-label={`Published date: ${date}`}>
              <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
              <time dateTime={new Date(date).toISOString()}>{date}</time>
            </div>
          </div>
        </div>

        {/* Read More Button */}
        <div className="flex justify-between items-center">
          <Link
            to={`/blogs/${id}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 group/btn"
            aria-label={`Read more about ${title}`}
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true" />
          </Link>
          
          {/* Reading Time Estimate */}
          <span className="text-xs text-gray-400" aria-label={`Estimated reading time: ${readingTime} minutes`}>
            {readingTime} min read
          </span>
        </div>
      </div>
    </article>
  );
}