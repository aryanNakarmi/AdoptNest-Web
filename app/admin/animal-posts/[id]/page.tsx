"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiArrowLeft, HiTrash, HiPencil, HiCheckCircle } from "react-icons/hi";
import {
  handleGetAnimalPostById,
  handleDeleteAnimalPost,
  handleUpdateAnimalPostStatus,
} from "@/lib/actions/animal-action";
import axios from "axios";

interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface AnimalPost {
  _id: string;
  species: string;
  gender: string;
  breed: string;
  age: number;
  location: string;
  description: string;
  photos: string[];
  status: "Available" | "Adopted";
  adoptedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith("auth_token=")) {
      return decodeURIComponent(cookie.substring("auth_token=".length));
    }
  }
  return null;
};

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<AnimalPost | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    fetchPost();
    fetchUsers();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await handleGetAnimalPostById(id);
      if (response.success) {
        setPost(response.data);
        if (response.data.adoptedBy) setSelectedUser(response.data.adoptedBy._id);
      } else toast.error(response.message || "Failed to load post");
    } catch (error: any) {
      toast.error(error.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `http://localhost:5050/api/v1/admin/users?page=1&size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.data) setUsers(response.data.data);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await handleDeleteAnimalPost(id);
      if (response.success) {
        toast.success("Post deleted successfully");
        router.push("/admin/animal-posts");
      } else toast.error(response.message || "Failed to delete post");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser) return toast.error("Please select a user");
    try {
      setUpdatingStatus(true);
      const response = await handleUpdateAnimalPostStatus(id, "Adopted", selectedUser);
      if (response.success) {
        setPost(response.data);
        setShowUpdateModal(false);
        toast.success("Animal marked as adopted");
      } else toast.error(response.message || "Failed to update status");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkAvailable = async () => {
    try {
      setUpdatingStatus(true);
      const response = await handleUpdateAnimalPostStatus(id, "Available");
      if (response.success) {
        setPost(response.data);
        toast.success("Animal marked as available");
      } else toast.error(response.message || "Failed to update status");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const nextPhoto = () => {
    if (post?.photos) setCurrentPhotoIndex((prev) => (prev + 1) % post.photos.length);
  };

  const prevPhoto = () => {
    if (post?.photos) setCurrentPhotoIndex((prev) => (prev - 1 + post.photos.length) % post.photos.length);
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );

  if (!post)
    return (
      <div className="text-center py-12 text-gray-600">
        Post not found.{" "}
        <Link href="/admin/animal-posts" className="text-red-600 hover:underline">
          Back
        </Link>
      </div>
    );

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/animal-posts" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <HiArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{post.breed}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photos & Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Photo */}
          <div className="relative w-full h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {post.photos.length > 0 ? (
              <Image
                src={`http://localhost:5050${post.photos[currentPhotoIndex]}`}
                alt={post.breed}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}

            {post.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                >
                  ❮
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                >
                  ❯
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                  {currentPhotoIndex + 1} / {post.photos.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {post.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {post.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    currentPhotoIndex === index ? "border-red-600" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={`http://localhost:5050${photo}`}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {/* Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Species</p>
                <p className="font-semibold text-gray-800">{post.species}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-semibold text-gray-800">{post.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-semibold text-gray-800">{post.age} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-800">{post.location}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-gray-700 ">{post.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar - Status & Actions */}
        <div className="space-y-4">
          {/* Status Card */}
          <div
            className={`rounded-2xl p-6 text-white ${
              post.status === "Available" ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            <p className="text-sm opacity-90 mb-2">Current Status</p>
            <p className="text-3xl font-bold mb-4">{post.status}</p>

            {post.status === "Adopted" && post.adoptedBy && (
              <div className="bg-white/20 rounded-lg p-4 mt-4">
                <p className="text-sm opacity-90 mb-2">Adopted By</p>
                <p className="font-semibold">{post.adoptedBy.fullName}</p>
                <p className="text-sm opacity-90">{post.adoptedBy.email}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {post.status === "Available" ? (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition"
              >
                <HiCheckCircle /> Mark as Adopted
              </button>
            ) : (
              <button
                onClick={handleMarkAvailable}
                disabled={updatingStatus}
                className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 font-semibold disabled:opacity-60 transition"
              >
                <HiCheckCircle /> Mark as Available
              </button>
            )}

            <Link
              href={`/admin/animal-posts/${id}/edit`}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
            >
              <HiPencil /> Edit Post
            </Link>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition"
            >
              <HiTrash /> Delete Post
            </button>
          </div>

          {/* Metadata */}
          <div className="text-gray-500 text-sm space-y-1 pt-4 border-t border-gray-200">
            <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mark as Adopted</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User Who Adopted
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black" 
                >
                  <option value="">-- Select a user --</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || !selectedUser}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-60"
                >
                  {updatingStatus ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Post</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}