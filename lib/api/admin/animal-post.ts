import { API } from "../endpoints";
import axios from "../axios";

export interface AnimalPost {
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

/**
 * Get all animal posts
 */
export const getAllAnimalPosts = async () => {
  try {
    const response = await axios.get(API.ANIMAL_POSTS.GET_ALL);
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch animal posts'
    );
  }
};

/**
 * Get single animal post by ID
 */
export const getAnimalPostById = async (postId: string) => {
  try {
    const response = await axios.get(API.ANIMAL_POSTS.GET_BY_ID(postId));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch animal post'
    );
  }
};

/**
 * Create new animal post with photos
 */
export const createAnimalPost = async (postData: FormData) => {
  try {
    const response = await axios.post(API.ANIMAL_POSTS.CREATE, postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to create animal post'
    );
  }
};

/**
 * Update animal post
 */
export const updateAnimalPost = async (postId: string, postData: FormData) => {
  try {
    const response = await axios.put(API.ANIMAL_POSTS.UPDATE(postId), postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update animal post'
    );
  }
};

/**
 * Update animal post status
 */
export const updateAnimalPostStatus = async (
  postId: string,
  status: 'Available' | 'Adopted',
  adoptedBy?: string
) => {
  try {
    const response = await axios.put(API.ANIMAL_POSTS.UPDATE_STATUS(postId), {
      status,
      adoptedBy,
    });
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to update post status'
    );
  }
};

/**
 * Delete animal post
 */
export const deleteAnimalPost = async (postId: string) => {
  try {
    const response = await axios.delete(API.ANIMAL_POSTS.DELETE(postId));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to delete animal post'
    );
  }
};

/**
 * Get animal posts by species
 */
export const getAnimalPostsBySpecies = async (species: string) => {
  try {
    const response = await axios.get(API.ANIMAL_POSTS.BY_SPECIES(species));
    return response.data;
  } catch (error: Error | any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch posts by species'
    );
  }
};