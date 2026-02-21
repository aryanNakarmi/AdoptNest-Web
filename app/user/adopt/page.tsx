'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { HiHeart, HiX, HiEye, HiSearch, HiFilter } from 'react-icons/hi';
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

const GENDER_OPTIONS = ['All', 'Male', 'Female'];

export default function AdoptPage() {
  const [allPosts, setAllPosts] = useState<AnimalPost[]>([]);
  const [myAdoptionsPosts, setMyAdoptionsPosts] = useState<AnimalPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<AnimalPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'all' | 'my-adoptions'>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Adopted'>('All');
  const [speciesFilter, setSpeciesFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allResponse = await axios.get(API.ANIMAL_POSTS.GET_ALL);
        setAllPosts(allResponse.data.data || []);
        try {
          const myResponse = await axios.get(`${BASE_URL}/api/v1/animal-posts/my-adoptions`);
          setMyAdoptionsPosts(myResponse.data.data || []);
        } catch {
          setMyAdoptionsPosts([]);
        }
      } catch {
        toast.error('Failed to load animals. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const dataToFilter = activeTab === 'all' ? allPosts : myAdoptionsPosts;
    let updated = [...dataToFilter];

    if (statusFilter !== 'All') updated = updated.filter((p) => p.status === statusFilter);
    if (speciesFilter !== 'All') updated = updated.filter((p) => p.species.toLowerCase() === speciesFilter.toLowerCase());
    if (genderFilter !== 'All') updated = updated.filter((p) => p.gender === genderFilter);
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      updated = updated.filter((post) =>
        [post._id, post.breed, post.location, post.species, post.gender, post.description]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(query))
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

  const speciesOptions = [
    'All',
    ...Array.from(new Set(allPosts.map((p) => p.species?.trim()).filter(Boolean))).sort(),
  ];

  const getStatusColor = (status: string) =>
    status === 'Available'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-blue-100 text-blue-800 border-blue-300';

  return (
    <div className="space-y-4 -mx-8 px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Adopt a Pet</h1>
        <p className="text-gray-500 mt-1">Browse animals available for adoption</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by breed, species, location..."
          className="w-full pl-11 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-400 bg-white text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
          >
            <HiX size={16} />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 bg-white p-3 rounded-lg border border-gray-200">
        <button
          onClick={() => { setActiveTab('all'); clearFilters(); }}
          className={`px-4 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'all' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Animals ({allPosts.length})
        </button>
        <button
          onClick={() => { setActiveTab('my-adoptions'); clearFilters(); }}
          className={`px-4 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'my-adoptions' ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          My Adoptions ({myAdoptionsPosts.length})
        </button>
      </div>

      {/* Main Layout: Cards LEFT, Filter Panel RIGHT */}
      <div className="flex gap-6 items-start">

        {/* LEFT — Cards take up all the space */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Active filter pills + result count */}
          {!loading && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-gray-500">
                Showing{' '}
                <span className="font-semibold text-gray-900">{filteredPosts.length}</span> of{' '}
                <span className="font-semibold text-gray-900">
                  {activeTab === 'all' ? allPosts.length : myAdoptionsPosts.length}
                </span>{' '}
                result(s)
              </p>
              <div className="flex flex-wrap gap-2">
                {speciesFilter !== 'All' && (
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1 rounded-full font-medium">
                    {speciesFilter}
                    <button onClick={() => setSpeciesFilter('All')}><HiX size={11} /></button>
                  </span>
                )}
                {genderFilter !== 'All' && (
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1 rounded-full font-medium">
                    {genderFilter}
                    <button onClick={() => setGenderFilter('All')}><HiX size={11} /></button>
                  </span>
                )}
                {statusFilter !== 'All' && (
                  <span className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-xs px-2.5 py-1 rounded-full font-medium">
                    {statusFilter}
                    <button onClick={() => setStatusFilter('All')}><HiX size={11} /></button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg mb-4">
                {activeFiltersCount > 0
                  ? `No ${activeTab === 'all' ? 'animals' : 'adoptions'} match your filters`
                  : activeTab === 'my-adoptions'
                  ? "You haven't adopted any animals yet"
                  : 'No animals available yet'}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
                >
                  <HiX size={18} /> Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* 3-col grid — cards are wide and breathe nicely */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className="rounded-xl shadow-md border border-gray-200 overflow-hidden transition transform hover:scale-[1.02] hover:shadow-xl bg-white"
                >
                  <div className="relative h-44 bg-gray-200">
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

                    {post.photos?.length > 0 && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-bold">
                        {post.photos.length} photos
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold border-2 ${getStatusColor(post.status)}`}>
                        {post.status}
                      </div>
                    </div>

                    {post.status === 'Adopted' && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="text-white text-center">
                          <HiHeart className="w-10 h-10 mx-auto mb-1" />
                          <p className="font-bold text-sm">Adopted</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{post.breed}</h3>
                      <p className="text-sm text-gray-500">{post.species} • {post.gender} • {post.age}m</p>
                    </div>
                    <p className="text-sm text-gray-600">{post.location}</p>
                    <p className="text-gray-700 text-sm line-clamp-2">{post.description}</p>

                    <Link
                      href={`/user/adopt/${post._id}`}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                    >
                      <HiEye size={16} />
                      View Details
                    </Link>

                    <p className="text-xs text-gray-400 pt-1 border-t border-gray-200">
                      Posted: {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Sticky filter panel pinned to right margin */}
        <aside className="w-52 flex-shrink-0 sticky top-4 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <HiFilter size={14} /> Filters
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {/* Species — dropdown */}
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Species</p>
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {speciesOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Gender — radio */}
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Gender</p>
              <div className="space-y-2">
                {GENDER_OPTIONS.map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={genderFilter === g}
                      onChange={() => setGenderFilter(g)}
                      className="accent-red-600 w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition ${genderFilter === g ? 'text-red-600 font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status — radio */}
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</p>
              <div className="space-y-2">
                {(['All', 'Available', 'Adopted'] as const).map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={statusFilter === s}
                      onChange={() => setStatusFilter(s)}
                      className="accent-red-600 w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition ${statusFilter === s ? 'text-red-600 font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {s}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}