'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import axios from "@/lib/api/axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") || "http://localhost:5050";

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
  const router = useRouter();
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
      setLoading(true);
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

  if (loading) return <div className="flex justify-center py-12 text-gray-500">Loading...</div>;
  if (!post) return <div className="text-center py-12 text-gray-500">Post not found</div>;

  return (
    <div className="space-y-8 p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/user/adopt" className="text-gray-500 hover:text-gray-700 font-medium">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{post.breed}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Carousel */}
          <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-md bg-gray-100">
            {post.photos.length > 0 ? (
              <Image
                src={`${BASE_URL}${post.photos[currentPhotoIndex]}`}
                alt={post.breed}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                No Image
              </div>
            )}

            {post.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition"
                >
                  ❮
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition"
                >
                  ❯
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {currentPhotoIndex + 1} / {post.photos.length}
                </div>
              </>
            )}
          </div>

          {/* Animal Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Species</p>
                <p className="font-semibold text-gray-800">{post.species}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gender</p>
                <p className="font-semibold text-gray-800">{post.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Age</p>
                <p className="font-semibold text-gray-800">{post.age} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="font-semibold text-gray-800">{post.location}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700 leading-relaxed">{post.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Status */}
        <div className="space-y-6">
          <div
            className={`rounded-2xl p-6 text-white shadow-md ${
              post.status === "Available" ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            <p className="text-sm opacity-90 mb-2">Status</p>
            <p className="text-3xl font-bold">{post.status}</p>
          </div>

          {/* Optional: Adopt Button */}
          {post.status === "Available" && (
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-2xl shadow-md transition">
              Adopt This Pet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}