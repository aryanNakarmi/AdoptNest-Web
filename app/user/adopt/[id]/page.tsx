'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
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
    if (post?.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % post.photos.length);
    }
  };

  const prevPhoto = () => {
    if (post?.photos) {
      setCurrentPhotoIndex(
        (prev) => (prev - 1 + post.photos.length) % post.photos.length
      );
    }
  };

  const copyAnimalId = () => {
    if (!post?._id) return;
    navigator.clipboard.writeText(post._id);
    toast.success("Animal ID copied to clipboard");
  };

  if (loading)
    return (
      <div className="flex justify-center py-20 text-gray-500 text-lg">
        Loading animal details...
      </div>
    );

  if (!post)
    return (
      <div className="text-center py-20 text-gray-500 text-lg">
        Animal not found
      </div>
    );

  return (
    <div className="space-y-10">
      {/* Back */}
      <Link
        href="/user/adopt"
        className="text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Back to Adopt
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image */}
          <div className="relative w-full h-[420px] rounded-3xl overflow-hidden shadow-md bg-gray-100">
            {post.photos.length > 0 ? (
              <Image
                src={`${BASE_URL}${post.photos[currentPhotoIndex]}`}
                alt={post.breed}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}

            {post.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur px-3 py-2 rounded-full shadow hover:bg-white transition"
                >
                  ❮
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 backdrop-blur px-3 py-2 rounded-full shadow hover:bg-white transition"
                >
                  ❯
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-1 rounded-full">
                  {currentPhotoIndex + 1} / {post.photos.length}
                </div>
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {post.breed}
              </h1>
              <p className="text-gray-500 mt-1">
                {post.species} • {post.gender}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <InfoItem label="Age" value={`${post.age} months`} />
              <InfoItem label="Location" value={post.location} />
              <InfoItem label="Species" value={post.species} />
              <InfoItem label="Gender" value={post.gender} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                Description
              </p>
              <p className="text-gray-700 leading-relaxed">
                {post.description}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Subtle Info Panel */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
              
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Animal Reference ID
                </p>
                <p className="text-sm font-semibold text-gray-800 break-all mt-1">
                  {post._id}
                </p>
              </div>

              <button
                onClick={copyAnimalId}
                className="text-sm text-white bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg transition"
              >
                Copy ID
              </button>

              <p className="text-xs text-gray-500 leading-relaxed">
                For adoption inquiries, please send this ID together with
                a screenshot of the animal profile to our admin team.
              </p>

              <p className="text-xs text-gray-400">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}