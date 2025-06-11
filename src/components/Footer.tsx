import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About QuestMeraki</h3>
            <p className="text-gray-600">
              Discover amazing stories, insights, and perspectives from our community of writers.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-indigo-600">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-indigo-600">About</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-indigo-600">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/technology" className="text-gray-600 hover:text-indigo-600">Technology</Link>
              </li>
              <li>
                <Link to="/category/travel" className="text-gray-600 hover:text-indigo-600">Travel</Link>
              </li>
              <li>
                <Link to="/category/food" className="text-gray-600 hover:text-indigo-600">Food</Link>
              </li>
              <li>
                <Link to="/category/lifestyle" className="text-gray-600 hover:text-indigo-600">Lifestyle</Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-indigo-600">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-indigo-600">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} BlogVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}