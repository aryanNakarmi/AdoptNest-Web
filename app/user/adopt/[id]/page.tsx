'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiArrowLeft, HiHeart, HiCheckCircle, HiX } from "react-icons/hi";
import axios from "@/lib/api/axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:5050";

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
  adoptionRequests?: { userId: string }[];
  createdAt: string;
  updatedAt: string;
}

// Get current user id from JWT stored in cookie
const getCurrentUserId = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith("auth_token=")) {
      try {
        const token = decodeURIComponent(c.substring("auth_token=".length));
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.id || payload._id || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

export default function UserAnimalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<AnimalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const currentUserId = getCurrentUserId();

  const hasRequested = !!(
    currentUserId &&
    post?.adoptionRequests?.some((r) => r.userId === currentUserId)
  );
  const interestedCount = post?.adoptionRequests?.length || 0;

  useEffect(() => {
    if (!id) return;
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/animal-posts/${id}`);
      setPost(res.data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdoption = async () => {
    setShowConfirmModal(false);
    try {
      setRequesting(true);
      const res = await axios.post(`${BASE_URL}/api/v1/animal-posts/${id}/request-adoption`);
      if (res.data.success) {
        toast.success("Adoption request sent! The admin will review it.");
        fetchPost(); // refresh to update button state
      } else {
        toast.error(res.data.message || "Failed to send request");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    } finally {
      setRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    setShowCancelModal(false);
    try {
      setCancelling(true);
      const res = await axios.delete(`${BASE_URL}/api/v1/animal-posts/${id}/request-adoption`);
      if (res.data.success) {
        toast.success("Adoption request cancelled");
        fetchPost();
      } else {
        toast.error(res.data.message || "Failed to cancel");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancelling(false);
    }
  };

  const nextPhoto = () => {
    if (post?.photos) setCurrentPhotoIndex((p) => (p + 1) % post.photos.length);
  };
  const prevPhoto = () => {
    if (post?.photos) setCurrentPhotoIndex((p) => (p - 1 + post.photos.length) % post.photos.length);
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );

  if (!post)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Animal not found.{" "}
        <Link href="/user/adopt" className="text-red-600 hover:underline">Back to Adopt</Link>
      </div>
    );

  return (
    <div className="flex flex-col h-full gap-4 p-4 lg:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/user/adopt" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <HiArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{post.breed}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
          post.status === "Available"
            ? "bg-green-100 text-green-800 border-green-300"
            : "bg-blue-100 text-blue-800 border-blue-300"
        }`}>
          {post.status}
        </span>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

        {/* LEFT — Photos + details */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          <div className="relative w-full h-64 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {post.photos.length > 0 ? (
              <Image src={`${BASE_URL}${post.photos[currentPhotoIndex]}`} alt={post.breed} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image Available</div>
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
            <div className="flex gap-2 overflow-x-auto flex-shrink-0">
              {post.photos.map((photo, i) => (
                <button key={i} onClick={() => setCurrentPhotoIndex(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    currentPhotoIndex === i ? "border-red-600" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image src={`${BASE_URL}${photo}`} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4 flex-shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Species</p><p className="font-semibold text-gray-800 text-sm">{post.species}</p></div>
              <div><p className="text-xs text-gray-500">Gender</p><p className="font-semibold text-gray-800 text-sm">{post.gender}</p></div>
              <div><p className="text-xs text-gray-500">Age</p><p className="font-semibold text-gray-800 text-sm">{post.age} months</p></div>
              <div><p className="text-xs text-gray-500">Location</p><p className="font-semibold text-gray-800 text-sm">{post.location}</p></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed">{post.description}</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Sidebar */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
          {/* Status */}
          <div className={`rounded-2xl p-5 text-white flex-shrink-0 ${post.status === "Available" ? "bg-green-600" : "bg-blue-600"}`}>
            <p className="text-sm opacity-90 mb-1">Current Status</p>
            <p className="text-2xl font-bold">{post.status}</p>
            <p className="text-xs opacity-80 mt-1">
              {post.status === "Available" ? "This animal is looking for a home" : "This animal has found a home"}
            </p>
          </div>

          {/* ── ADOPTION REQUEST CARD ── */}
          {post.status === "Available" && (
            <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-800">Interested in adopting?</h3>
{interestedCount > 0 && (
  <div className="flex items-center gap-2 text-red-600 text-sm font-semibold">
    <HiHeart size={16} />
    {interestedCount} {interestedCount === 1 ? "Interested" : "Interested"}
  </div>
)}
              {hasRequested ? (
                <>
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <HiCheckCircle className="text-green-600 flex-shrink-0" size={18} />
                    <p className="text-sm text-green-700 font-medium">Your adoption request has been submmitted.T</p>
                  </div>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 py-2 rounded-lg font-semibold transition text-sm disabled:opacity-60"
                  >
                    <HiX size={15} />
                    {cancelling ? "Cancelling..." : "Cancel Request"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Click the button below to send an adoption request. The admin will see your name and email and reach out to you.
                  </p>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={requesting}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold transition text-sm disabled:opacity-60"
                  >
                    <HiHeart size={16} />
                    {requesting ? "Sending..." : "Request Adoption"}
                  </button>
                </>
              )}
            </div>
          )}

          {post.status === "Adopted" && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex-shrink-0">
              <div className="flex items-center gap-2 text-blue-700">
                <HiHeart size={20} />
                <p className="font-semibold text-sm">This animal has already been adopted.</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-gray-400 text-xs space-y-1 pt-3 border-t border-gray-200 flex-shrink-0">
            <p>Posted: {new Date(post.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Confirm Request Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-3">
                <HiHeart className="text-red-600" size={28} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Send Adoption Request?</h2>
              <p className="text-gray-500 text-sm mt-2">
                Your name and email will be shared with the admin so they can contact you about adopting <strong>{post.breed}</strong>.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                Cancel
              </button>
              <button onClick={handleRequestAdoption} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Adoption Request?</h2>
            <p className="text-gray-500 text-sm">Are you sure you want to withdraw your adoption request for <strong>{post.breed}</strong>?</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
                Keep Request
              </button>
              <button onClick={handleCancelRequest} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                Cancel It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
