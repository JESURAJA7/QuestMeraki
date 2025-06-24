import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Save, Upload, ArrowLeft, Trash2 } from 'lucide-react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

const API_URL = import.meta.env.VITE_API_URL;

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string;
  status: string;
  author: {
    _id: string;
    name: string;
  };
}

export default function EditPost() {
  const { id } = useParams();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Write your blog content here...',
      }),
    ],
    content: '',
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${API_URL}/blogs/u/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPost(data);
          setTitle(data.title);
          setCategory(data.category);
          setCurrentImageUrl(data.imageUrl);
          editor?.commands.setContent(data.content);
        } else {
          setError('Failed to fetch blog post');
        }
      } catch (error) {
        setError('Failed to fetch blog post');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && editor) {
      fetchPost();
    }
  }, [id, editor]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', editor?.getHTML() || '');
      formData.append('category', category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate('/admin/manage-posts');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update blog post');
      }
    } catch (error) {
      setError('Failed to update blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        navigate('/admin/manage-posts');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete blog post');
      }
    } catch (error) {
      setError('Failed to delete blog post');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h2>
          <button
            onClick={() => navigate('/admin/manage-posts')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Manage Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/manage-posts')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Manage Posts
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Blog Post</h1>
                <p className="text-gray-600">
                  Author: {post.author.name} | Status: 
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </p>
              </div>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Technology">Technology</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Health">Health & Wellness</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {imageFile ? 'Change Image' : 'Upload New Image'}
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    {imageFile ? imageFile.name : 'Current image will be kept if no new image is uploaded'}
                  </span>
                </div>
                
                {/* Show current image or new preview */}
                {(imagePreview || currentImageUrl) && (
                  <div className="mt-4">
                    <div className="h-48 w-full rounded-md overflow-hidden">
                      <img
                        src={imagePreview || currentImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {imagePreview && (
                      <p className="text-sm text-gray-500 mt-2">New image preview</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
                  {editor && (
                    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                      <div className="flex bg-white shadow-lg rounded-md p-1 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                        >
                          <span className="font-bold">B</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                          className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                        >
                          <span className="italic">I</span>
                        </button>
                      </div>
                    </BubbleMenu>
                  )}
                  
                  <div className="border-b border-gray-300 bg-gray-50 px-4 py-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                    >
                      <span className="font-bold text-sm">B</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                    >
                      <span className="italic text-sm">I</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                    >
                      <span className="text-sm">•</span>
                    </button>
                  </div>
                  
                  <EditorContent
                    editor={editor}
                    className="min-h-[300px] p-4 focus:outline-none prose max-w-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Update Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}