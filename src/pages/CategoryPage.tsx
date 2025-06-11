import { useParams } from 'react-router-dom';
import BlogCard from '../components/BlogCard';

export default function CategoryPage() {
  const { category } = useParams();

  // Temporary mock data
  const posts = [
    {
      id: '1',
      title: 'The Future of Web Development: What to Expect in 2025',
      excerpt: 'Discover the upcoming trends and technologies that will shape the future of web development.',
      author: 'John Doe',
      date: 'March 1, 2024',
      imageUrl: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
      category: 'Technology'
    },
    {
      id: '2',
      title: 'Building Scalable Applications with Modern Architecture',
      excerpt: 'Learn about the best practices for creating scalable and maintainable web applications.',
      author: 'Jane Smith',
      date: 'February 28, 2024',
      imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
      category: 'Technology'
    },
    {
      id: '3',
      title: 'The Impact of AI on Software Development',
      excerpt: 'Exploring how artificial intelligence is transforming the software development landscape.',
      author: 'Mike Johnson',
      date: 'February 27, 2024',
      imageUrl: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
      category: 'Technology'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 capitalize">
          {category} Articles
        </h1>
        <p className="mt-2 text-gray-600">
          Explore our latest articles about {category?.toLowerCase()}.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}