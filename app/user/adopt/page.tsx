'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiHeart, HiX, HiChevronDown } from 'react-icons/hi';
import axios from '@/lib/api/axios';
import { API } from '@/lib/api/endpoints';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

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

const SPECIES_OPTIONS = ['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Other'];
const GENDER_OPTIONS = ['All', 'Male', 'Female'];

export default function AdoptPage() {
  const [allPosts, setAllPosts] = useState<AnimalPost[]>([]);
  const [myAdoptionsPosts, setMyAdoptionsPosts] = useState<AnimalPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<AnimalPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<'all' | 'my-adoptions'>('all');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Adopted'>('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all posts
        const allResponse = await axios.get(API.ANIMAL_POSTS.GET_ALL);
        setAllPosts(allResponse.data.data || []);

        try {
          const myResponse = await axios.get(`${BASE_URL}/api/v1/animal-posts/my-adoptions`);
          setMyAdoptionsPosts(myResponse.data.data || []);
        } catch (error: any) {
          // If endpoint fails, try old method
          console.warn('Failed to fetch from my-adoptions endpoint, using fallback');
          setMyAdoptionsPosts([]);
        }
      } catch (err: any) {
        console.error('Error:', err);
        toast.error('Failed to load animals. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    // Choose which dataset to filter based on active tab
    const dataToFilter = activeTab === 'all' ? allPosts : myAdoptionsPosts;
    let updated = [...dataToFilter];

    // Apply status filter
    if (statusFilter !== 'All') {
      updated = updated.filter((post) => post.status === statusFilter);
    }

    // Apply species filter
    if (speciesFilter !== 'All') {
      updated = updated.filter((post) => post.species.toLowerCase() === speciesFilter.toLowerCase());
    }

    // Apply gender filter
    if (genderFilter !== 'All') {
      updated = updated.filter((post) => post.gender === genderFilter);
    }

    // Apply search filter
 if (searchQuery.trim() !== '') {
  const query = searchQuery.toLowerCase();

  updated = updated.filter((post) =>
    [
      post.breed,
      post.location,
      post.species,
      post.gender,
      post.description,
    ]
      .filter(Boolean)
      .some((field) =>
        field.toLowerCase().includes(query)
      )
  );
}

    setFilteredPosts(updated);
  }, [allPosts, myAdoptionsPosts, activeTab, statusFilter, speciesFilter, genderFilter, searchQuery]);

  const clearFilters = () => {
    setStatusFilter('All');
    setSpeciesFilter('All');
    setGenderFilter('All');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    statusFilter !== 'All',
    speciesFilter !== 'All',
    genderFilter !== 'All',
    searchQuery.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Perfect Pet</h1>
          <p className="text-gray-600">Browse animals available for adoption</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-1 mb-8 border border-gray-200 inline-flex">
          <button
            onClick={() => {
              setActiveTab('all');
              clearFilters();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'all'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            
            All Animals ({allPosts.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('my-adoptions');
              clearFilters();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'my-adoptions'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            My Adoptions ({myAdoptionsPosts.length})
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HiChevronDown size={20} className="text-red-600" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition"
              >
                <HiX size={16} />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by breed or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Species Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              >
                {SPECIES_OPTIONS.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              >
                {GENDER_OPTIONS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Available' | 'Adopted')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Adopted">Adopted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Empty State - All Animals */}
        {!loading && activeTab === 'all' && filteredPosts.length === 0 && allPosts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="mb-4 text-6xl">🐾</div>
            <p className="text-gray-600 text-lg font-medium mb-2">No Animals Available</p>
            <p className="text-gray-500">Check back later for more animals to adopt!</p>
          </div>
        )}

        {/* No Results with Active Filters */}
        {!loading && filteredPosts.length === 0 && (activeTab === 'all' ? allPosts.length : myAdoptionsPosts.length) > 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-200">
            <p className="text-gray-600 text-lg font-medium mb-4">
              {activeTab === 'all' ? 'No animals' : 'No adoptions'} match your filters
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              <HiX size={18} />
              Clear Filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && filteredPosts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-200 hover:border-red-300 transform hover:scale-105"
                >
                  {/* Image */}
                  <div className="relative h-56 w-full bg-gray-200">
                    {post.photos && post.photos.length > 0 ? (
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

                    {/* Status Badge */}
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full text-white ${
                        post.status === 'Available' ? 'bg-green-500 shadow-lg' : 'bg-blue-500 shadow-lg'
                      }`}
                    >
                      {post.status}
                    </div>

                    {/* Photo Count */}
                    {post.photos && post.photos.length > 0 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
                        {post.photos.length} photos
                      </div>
                    )}

                    {/* Adopted Badge */}
                    {post.status === 'Adopted' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-white text-center">
                          <HiHeart className="w-12 h-12 mx-auto mb-2" />
                          <p className="font-bold">Adopted</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 capitalize">{post.breed}</h3>
                      <p className="text-sm text-gray-600">
                        {post.species} • {post.gender} • {post.age}m
                      </p>
                    </div>

                    <div className="space-y-1 text-sm text-gray-700">
                      <p className="flex items-center gap-1">
                        <span></span> {post.location}
                      </p>
                      <p className="line-clamp-2 text-gray-600">{post.description}</p>
                    </div>

                    <Link
                      href={`/animal/${post._id}`}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-center text-gray-600">
              Showing <span className="font-bold text-gray-900">{filteredPosts.length}</span> of{' '}
              <span className="font-bold text-gray-900">
                {activeTab === 'all' ? allPosts.length : myAdoptionsPosts.length}
              </span>{' '}
              result(s)
            </div>
          </>
        )}
      </div>
    </div>
  );
}