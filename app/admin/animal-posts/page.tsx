'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiPlus, HiEye, HiPencil, HiTrash, HiChevronDown } from 'react-icons/hi';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

interface AnimalPost {
  _id: string;
  species: string;
  gender: string;
  breed: string;
  age: number;
  location: string;
  description: string;
  photos: string[];
  status: 'Available' | 'Adopted';
  adoptedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getAuthToken = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith('auth_token=')) {
      return decodeURIComponent(cookie.substring('auth_token='.length));
    }
  }
  return null;
};

export default function AdminAnimalsPage() {
  const [posts, setPosts] = useState<AnimalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Available' | 'Adopted'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/animal-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPosts(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to load posts');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${API_BASE_URL}/animal-posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        setDeleteConfirm(null);
        toast.success('Post deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete post');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'Available' | 'Adopted') => {
    try {
      const token = getAuthToken();
      const response = await axios.put(
        `${API_BASE_URL}/animal-posts/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
        toast.success(`Status changed to ${newStatus}`);
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredPosts =
    selectedStatus === 'all' ? posts : posts.filter((p) => p.status === selectedStatus);

  const getStatusColor = (status: string) => {
    return status === 'Available'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getStatusBgColor = (status: string) => {
    return status === 'Available' ? 'bg-green-50' : 'bg-blue-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Animal Posts</h1>
          <p className="text-gray-600 mt-1">Manage animal posts for adoption</p>
        </div>
        <Link
          href="/admin/animal-posts/create"
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-bold shadow-lg"
        >
          <HiPlus size={20} />
          Create Post
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedStatus === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Posts ({posts.length})
        </button>
        <button
          onClick={() => setSelectedStatus('Available')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedStatus === 'Available'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Available ({posts.filter((p) => p.status === 'Available').length})
        </button>
        <button
          onClick={() => setSelectedStatus('Adopted')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedStatus === 'Adopted'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Adopted ({posts.filter((p) => p.status === 'Adopted').length})
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">No posts found</p>
          <Link
            href="/admin/animal-posts/create"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <HiPlus size={18} />
            Create First Post
          </Link>
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post._id}
              className={`rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition ${getStatusBgColor(
                post.status
              )}`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {post.photos && post.photos.length > 0 ? (
                  <Image
                    src={`${API_BASE_URL.replace('/api/v1', '')}${post.photos[0]}`}
                    alt={post.breed}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <HiEye className="text-gray-500" size={48} />
                  </div>
                )}

                {/* Photo Count Badge */}
                {post.photos && post.photos.length > 0 && (
                  <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                    {post.photos.length} photos
                  </div>
                )}

                {/* Status Badge with Dropdown */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <select
                    value={post.status}
                    onChange={(e) =>
                      handleStatusChange(post._id, e.target.value as 'Available' | 'Adopted')
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold border-2 cursor-pointer hover:opacity-90 transition appearance-none pr-6 ${getStatusColor(
                      post.status
                    )}`}
                  >
                    <option value="Available">Available</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                  <HiChevronDown
                    size={12}
                    className="absolute right-1 pointer-events-none text-gray-700"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Animal Info */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">
                    {post.breed}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {post.species} • {post.gender} • {post.age}m
                  </p>
                </div>

                {/* Location & Details */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📍 {post.location}</p>
                  {post.adoptedBy && post.status === 'Adopted' && (
                    <p className="text-xs text-blue-600 font-semibold">
                      Adopted by: {post.adoptedBy.fullName}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 line-clamp-2">
                  {post.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Link
                    href={`/admin/animal-posts/${post._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                  >
                    <HiEye size={16} />
                    View
                  </Link>
                  <Link
                    href={`/admin/animal-posts/${post._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                  >
                    <HiPencil size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(post._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    <HiTrash size={16} />
                    Delete
                  </button>
                </div>

                {/* Meta Info */}
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Delete Confirmation */}
              {deleteConfirm === post._id && (
                <div className="bg-red-50 border-t-2 border-red-500 p-4 space-y-3">
                  <p className="text-sm text-red-900 font-bold">Delete this post?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-bold text-sm transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-bold text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}