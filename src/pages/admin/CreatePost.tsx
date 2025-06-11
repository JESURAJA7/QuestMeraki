import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Save, Upload, Image as ImageIcon, Bold, Italic, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

// Use environment variable directly if available, fallback to localhost
const API_URL = import.meta.env.VITE_API_URL ;

export default function CreateBlog() {
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      formData.append('subtitle', subtitle);
      formData.append('content', editor?.getHTML() || '');
      formData.append('category', category);

      if (imageFile) {
        formData.append('image', imageFile);
      }
      console.log('Submitting form data:', { formData });
      console.log("token", localStorage.getItem('token'));
      const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        navigate('/my-blogs');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create blog post');
      }
    } catch (error) {
      setError('Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Blog Post</h1>
            <p className="text-gray-600 mb-6">Share your thoughts and ideas with the world</p>

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
                  <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    placeholder="Enter blog subtitle"
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
                    Upload Image
                  </button>
                  <span className="ml-4 text-sm text-gray-500">
                    {imageFile ? imageFile.name : 'No file selected'}
                  </span>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <div className="h-48 w-full rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
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
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                        >
                          <Bold className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                          className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                        >
                          <Italic className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('left').run()}
                          className={`p-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                        >
                          <AlignLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('center').run()}
                          className={`p-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                        >
                          <AlignCenter className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('right').run()}
                          className={`p-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                        >
                          <AlignRight className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleBulletList().run()}
                          className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                        >
                          <List className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleOrderedList().run()}
                          className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                        >
                          <ListOrdered className="w-5 h-5" />
                        </button>
                      </div>
                    </BubbleMenu>
                  )}
                  
                  <div className="border-b border-gray-300 bg-gray-50 px-4 py-2 flex items-center space-x-2">
                    <button
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                      className={`p-1 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                      className={`p-1 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                      className={`p-1 rounded ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                      className={`p-1 rounded ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                      className={`p-1 rounded ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                    >
                      <AlignRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                      className={`p-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                      className={`p-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                    >
                      <ListOrdered className="w-4 h-4" />
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
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Publish Blog
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