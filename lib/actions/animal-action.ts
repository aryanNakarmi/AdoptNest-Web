"use server";

import {
  getAllAnimalPosts,
  getAnimalPostById,
  createAnimalPost,
  updateAnimalPost,
  updateAnimalPostStatus,
  deleteAnimalPost,
  getAnimalPostsBySpecies,
} from "@/lib/api/admin/animal-post"
import { revalidatePath } from "next/cache";

/**
 * Get all animal posts
 */
export const handleGetAllAnimalPosts = async () => {
  try {
    const response = await getAllAnimalPosts();
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch posts",
      data: [],
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch animal posts",
      data: [],
    };
  }
};

/**
 * Get single animal post by ID
 */
export const handleGetAnimalPostById = async (postId: string) => {
  try {
    const response = await getAnimalPostById(postId);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch post",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch animal post",
      data: null,
    };
  }
};

/**
 * Create new animal post
 */
export const handleCreateAnimalPost = async (formData: FormData) => {
  try {
    const response = await createAnimalPost(formData);
    if (response.success) {
      revalidatePath("/admin/animal-posts");
      return {
        success: true,
        message: "Animal post created successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to create post",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to create animal post",
      data: null,
    };
  }
};

/**
 * Update animal post
 */
export const handleUpdateAnimalPost = async (postId: string, formData: FormData) => {
  try {
    const response = await updateAnimalPost(postId, formData);
    if (response.success) {
      revalidatePath("/admin/animal-posts");
      revalidatePath(`/admin/animal-posts/${postId}`);
      return {
        success: true,
        message: "Animal post updated successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to update post",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to update animal post",
      data: null,
    };
  }
};

/**
 * Update animal post status
 */
export const handleUpdateAnimalPostStatus = async (
  postId: string,
  status: 'Available' | 'Adopted',
  adoptedBy?: string
) => {
  try {
    const response = await updateAnimalPostStatus(postId, status, adoptedBy);
    if (response.success) {
      revalidatePath("/admin/animal-posts");
      return {
        success: true,
        message: "Post status updated successfully",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to update status",
      data: null,
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to update post status",
      data: null,
    };
  }
};

/**
 * Delete animal post
 */
export const handleDeleteAnimalPost = async (postId: string) => {
  try {
    const response = await deleteAnimalPost(postId);
    if (response.success) {
      revalidatePath("/admin/animal-posts");
      return {
        success: true,
        message: "Animal post deleted successfully",
      };
    }
    return {
      success: false,
      message: response.message || "Failed to delete post",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to delete animal post",
    };
  }
};

/**
 * Get animal posts by species
 */
export const handleGetAnimalPostsBySpecies = async (species: string) => {
  try {
    const response = await getAnimalPostsBySpecies(species);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "Failed to fetch posts",
      data: [],
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "Failed to fetch posts by species",
      data: [],
    };
  }
};