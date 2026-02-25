"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiArrowLeft, HiTrash, HiPencil, HiCheckCircle, HiMail, HiUser, HiClock } from "react-icons/hi";
import {
  handleGetAnimalPostById,
  handleDeleteAnimalPost,
  handleUpdateAnimalPostStatus,
} from "@/lib/actions/animal-action";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:5050";interface AdoptionRequest {
  userId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  requestedAt: string;
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
  adoptedBy?: { _id: string; fullName: string; email: string };
  adoptionRequests?: AdoptionRequest[];
  createdAt: string;
  updatedAt: string;
}

export default function AnimalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<AnimalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "requests">("details");

  useEffect(() => {
    fetchPost();
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

  const nextPhoto = () => { if (post?.photos) setCurrentPhotoIndex((p) => (p + 1) % post.photos.length); };
  const prevPhoto = () => { if (post?.photos) setCurrentPhotoIndex((p) => (p - 1 + post.photos.length) % post.photos.length); };

  const adoptionRequests = post?.adoptionRequests ?? [];

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );

  if (!post)
    return (
      <div className="text-center py-12 text-gray-600">
        Post not found.{" "}
        <Link href="/admin/animal-posts" className="text-red-600 hover:underline">Back</Link>
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
        {/* LEFT — Photos + Tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Photo */}
          <div className="relative w-full h-96 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {post.photos.length > 0 ? (
              <Image src={`${BASE_URL}${post.photos[currentPhotoIndex]}`} alt={post.breed} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
            {post.photos.length > 1 && (
              <>
                <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition">❮</button>
                <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition">❯</button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-sm px-3 py-1 rounded-full">
                  {currentPhotoIndex + 1} / {post.photos.length}
                </div>
              </>
            )}
          </div>

          {post.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {post.photos.map((photo, i) => (
                <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    currentPhotoIndex === i ? "border-red-600" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image src={`${BASE_URL}${photo}`} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}

          {/* Tabs: Details | Adoption Requests */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 px-6 py-3 text-sm font-semibold transition ${
                  activeTab === "details" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab("requests")}
                className={`flex-1 px-6 py-3 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === "requests" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Adoption Requests
                {adoptionRequests.length > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {adoptionRequests.length}
                  </span>
                )}
              </button>
            </div>

            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><p className="text-sm text-gray-500">Species</p><p className="font-semibold text-gray-800">{post.species}</p></div>
                  <div><p className="text-sm text-gray-500">Gender</p><p className="font-semibold text-gray-800">{post.gender}</p></div>
                  <div><p className="text-sm text-gray-500">Age</p><p className="font-semibold text-gray-800">{post.age} months</p></div>
                  <div><p className="text-sm text-gray-500">Location</p><p className="font-semibold text-gray-800">{post.location}</p></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{post.description}</p>
                </div>
              </div>
            )}

            {/* Adoption Requests Tab */}
            {activeTab === "requests" && (
              <div className="p-6">
                {adoptionRequests.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <HiUser size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No adoption requests yet</p>
                    <p className="text-sm mt-1">Requests from interested users will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 mb-4">
                      <strong className="text-gray-900">{adoptionRequests.length}</strong> user{adoptionRequests.length !== 1 ? "s" : ""} interested in this animal
                    </p>
                    {adoptionRequests.map((req, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        {/* Avatar — shows profile pic or initials fallback */}
                        <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-gray-200">
                          {req.profilePicture ? (
                            <Image
                              src={`${BASE_URL}${req.profilePicture}`}
                              alt={req.fullName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-bold text-sm">
                                {req.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-gray-900">{req.fullName}</span>
                          <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                            <HiMail size={14} />
                            {req.email}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <HiClock size={12} />
                            Requested {new Date(req.requestedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <div className={`rounded-2xl p-6 text-white ${post.status === "Available" ? "bg-green-600" : "bg-blue-600"}`}>
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

          {/* Actions */}
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
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Animal Reference ID</p>
              <p className="text-sm font-semibold text-gray-800 break-all mt-1">{post._id}</p>
            </div>
            <p>Created: {new Date(post.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Mark as Adopted</h2>
            <p className="text-sm text-gray-500 mb-4">Select the user who adopted this animal</p>

            {adoptionRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <HiUser size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No adoption requests yet</p>
                <p className="text-sm mt-1">No users have requested to adopt this animal</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {adoptionRequests.map((req, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedUser(req.userId)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition flex items-center gap-3 ${
                      selectedUser === req.userId
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border border-gray-200">
                      {req.profilePicture ? (
                        <Image
                          src={`${BASE_URL}${req.profilePicture}`}
                          alt={req.fullName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-bold text-xs">
                            {req.fullName?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{req.fullName}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{req.email}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Requested: {new Date(req.requestedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowUpdateModal(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold">
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Delete Post</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}