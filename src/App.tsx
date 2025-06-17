import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import CategoryPage from './pages/CategoryPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreatePost from './pages/admin/CreatePost';
import ManagePosts from './pages/admin/ManagePosts';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CreateBlog from './pages/CreateBlog';
import MyBlogs from './pages/MyBlogs';
import PrivateRoute from './components/PrivateRoute';
import BlogDetail from './pages/BlogDetail';
import AdminBlogs from './pages/admin/AdminBlogs';
import EditPost from './pages/admin/EditPost';
import UserBlogs from './pages/admin/UserBlogs';
import BlogsPage from './pages/BlogsPage';
import Contact from './pages/Contact';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<BlogPost />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/create-blog" element={<PrivateRoute><CreateBlog /></PrivateRoute>} />
            <Route path="/my-blogs" element={<PrivateRoute><MyBlogs /></PrivateRoute>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/create-post" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
            <Route path="/admin/manage-posts" element={<PrivateRoute><ManagePosts /></PrivateRoute>} />
            <Route path="/admin/blogs" element={<PrivateRoute><AdminBlogs /></PrivateRoute>} />
            <Route path="/admin/edit-post/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
            <Route path="/admin/user-blogs" element={<PrivateRoute><UserBlogs /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App