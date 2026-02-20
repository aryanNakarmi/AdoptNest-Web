'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiPlus, HiEye } from 'react-icons/hi';
import { 
  handleGetAllAnimalPosts
} from '@/lib/actions/animal-action';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5050';

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

export default function AdminAnimalsPage() {
  const [posts, setPosts] = useState<AnimalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Available' | 'Adopted'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await handleGetAllAnimalPosts();

      if (response.success) {
        setPosts(response.data);
      } else {
        toast.error(response.message || 'Failed to load posts');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
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
                {post.photos && post.photos.length > 0 && post.photos[0] ? (
                  <Image
                    src={`${BASE_URL}${post.photos[0]}`}
                    alt={post.breed}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-600 font-medium">No Image</span>
                  </div>
                )}

                {/* Photo Count Badge */}
                {post.photos && post.photos.length > 0 && (
                  <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                    {post.photos.length} photos
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(post.status)}`}>
                    {post.status}
                  </div>
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
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href={`/admin/animal-posts/${post._id}`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                  >
                    <HiEye size={16} />
                    View Details
                  </Link>
                </div>

                {/* Meta Info */}
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                  Created: {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}