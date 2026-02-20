'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiPlus, HiEye } from 'react-icons/hi';
import { handleGetAllAnimalPosts } from '@/lib/actions/animal-action';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5050';

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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await handleGetAllAnimalPosts();
      if (response.success) setPosts(response.data);
      else toast.error(response.message || 'Failed to load posts');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Filter by status first
  const filteredPosts =
    selectedStatus === 'all' ? posts : posts.filter((p) => p.status === selectedStatus);

  // Then filter by search query (breed or species)
  const searchedPosts = filteredPosts.filter((post) => {
    const query = searchQuery.toLowerCase();
    return post.breed.toLowerCase().includes(query) || post.species.toLowerCase().includes(query);
  });

  const getStatusColor = (status: string) =>
    status === 'Available'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-blue-100 text-blue-800 border-blue-300';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Animal Posts</h1>
          <p className="text-gray-500 mt-1">Manage all animal adoption posts</p>
        </div>
        <Link
          href="/admin/animal-posts/create"
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-red-700 transition"
        >
          <HiPlus size={18} />
          Create Post
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by breed or species..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none
          focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3
          text-black placeholder-black/50 pr-10"
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            &#10005; {/* X icon */}
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-3 bg-white p-3 rounded-lg border border-gray-200">
        {['all', 'Available', 'Adopted'].map((status) => {
          const label =
            status === 'all'
              ? `All Posts (${posts.length})`
              : `${status} (${posts.filter((p) => p.status === status).length})`;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as 'all' | 'Available' | 'Adopted')}
              className={`px-4 py-1.5 rounded-lg font-medium transition ${
                selectedStatus === status
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Loading / Empty State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
        </div>
      ) : searchedPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-black text-lg mb-4">No posts found</p>
          <Link
            href="/admin/animal-posts/create"
            className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
          >
            <HiPlus size={18} />
            Create Post
          </Link>
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {searchedPosts.map((post) => (
            <div
              key={post._id}
              className="rounded-xl shadow-md border border-gray-200 overflow-hidden transition transform hover:scale-105 hover:shadow-lg bg-white"
            >
              {/* Image */}
              <div className="relative h-40 bg-gray-200">
                {post.photos?.[0] ? (
                  <Image
                    src={`${BASE_URL}${post.photos[0]}`}
                    alt={post.breed}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <span className="text-gray-600 font-medium text-sm">No Image</span>
                  </div>
                )}

                {/* Photo Count Badge */}
                {post.photos?.length > 0 && (
                  <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-bold">
                    {post.photos.length} photos
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`px-2 py-0.5 rounded-full text-xs font-bold border-2 ${getStatusColor(
                      post.status
                    )}`}
                  >
                    {post.status}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">{post.breed}</h3>
                  <p className="text-sm text-gray-500">
                    {post.species} • {post.gender} • {post.age}m
                  </p>
                </div>

                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>{post.location}</p>
                  {post.adoptedBy && post.status === 'Adopted' && (
                    <p className="text-xs text-blue-600 font-semibold">
                      Adopted by: {post.adoptedBy.fullName}
                    </p>
                  )}
                </div>

                <p className="text-gray-700 text-sm line-clamp-2">{post.description}</p>

                <Link
                  href={`/admin/animal-posts/${post._id}`}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                >
                  <HiEye size={16} />
                  View Details
                </Link>

                <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
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