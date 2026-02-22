'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiArrowLeft, HiClipboardCopy } from "react-icons/hi";
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
  createdAt: string;
  updatedAt: string;
}

export default function UserAnimalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<AnimalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  const nextPhoto = () => {
    if (post?.photos) setCurrentPhotoIndex((prev) => (prev + 1) % post.photos.length);
  };

  const prevPhoto = () => {
    if (post?.photos) setCurrentPhotoIndex((prev) => (prev - 1 + post.photos.length) % post.photos.length);
  };

  const copyAnimalId = () => {
    if (!post?._id) return;
    navigator.clipboard.writeText(post._id);
    toast.success("Animal ID copied to clipboard");
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );

  if (!post)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Animal not found.{" "}
        <Link href="/user/adopt" className="text-red-600 hover:underline">
          Back to Adopt
        </Link>
      </div>
    );

  return (
    <div className="flex flex-col h-full gap-4 p-4 lg:p-6 overflow-hidden">
      {/* Header — fixed at top */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link
          href="/user/adopt"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <HiArrowLeft size={20} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{post.breed}</h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${
            post.status === "Available"
              ? "bg-green-100 text-green-800 border-green-300"
              : "bg-blue-100 text-blue-800 border-blue-300"
          }`}
        >
          {post.status}
        </span>
      </div>

      {/* Body — fills remaining height, no overflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

        {/* LEFT — Photo + details, scrollable if needed */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          {/* Main Photo — smaller fixed height */}
          <div className="relative w-full h-64 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            {post.photos.length > 0 ? (
              <Image
                src={`${BASE_URL}${post.photos[currentPhotoIndex]}`}
                alt={post.breed}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                No Image Available
              </div>
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
            <div className="flex gap-2 overflow-x-auto flex-shrink-0">
              {post.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    currentPhotoIndex === index
                      ? "border-red-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={`${BASE_URL}${photo}`}
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
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-4 flex-shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Species</p>
                <p className="font-semibold text-gray-800 text-sm">{post.species}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-semibold text-gray-800 text-sm">{post.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Age</p>
                <p className="font-semibold text-gray-800 text-sm">{post.age} months</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-semibold text-gray-800 text-sm">{post.location}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-gray-700 text-sm leading-relaxed">{post.description}</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Sidebar, scrollable if needed */}
        <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
          {/* Status Card */}
          <div
            className={`rounded-2xl p-5 text-white flex-shrink-0 ${
              post.status === "Available" ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            <p className="text-sm opacity-90 mb-1">Current Status</p>
            <p className="text-2xl font-bold">{post.status}</p>
            <p className="text-xs opacity-80 mt-1">
              {post.status === "Available"
                ? "This animal is looking for a home "
                : "This animal has found a home "}
            </p>
          </div>

          {/* How to Adopt Card */}
          <div className="bg-white rounded-2xl shadow-lg p-5 space-y-3 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-800">How to Adopt</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Send this Reference ID along with the detail to our admin team.
            </p>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Reference ID
              </p>
              <p className="text-xs font-semibold text-gray-800 break-all bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                {post._id}
              </p>
            </div>
            <button
              onClick={copyAnimalId}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition text-sm"
            >
              <HiClipboardCopy size={15} />
              Copy Reference ID
            </button>
          </div>

          {/* Metadata */}
          <div className="text-gray-400 text-xs space-y-1 pt-3 border-t border-gray-200 flex-shrink-0">
            <p>Posted: {new Date(post.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}