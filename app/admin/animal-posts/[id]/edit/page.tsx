'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { handleGetAnimalPostById } from '@/lib/actions/animal-action';
import EditAnimalPostForm from '@/app/admin/animal-posts/_components/EditAnimalPostForm'; 
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

export default function EditAnimalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<AnimalPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await handleGetAnimalPostById(id);
      if (response.success) {
        setPost(response.data);
      } else {
        toast.error(response.message || 'Failed to load post');
        router.push('/admin/animal-posts');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load post');
      router.push('/admin/animal-posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Animal post not found</p>
        <button
          onClick={() => router.push('/admin/animal-posts')}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Animal Post</h1>
      <EditAnimalPostForm post={post} postId={post._id} />
    </div>
  );
}