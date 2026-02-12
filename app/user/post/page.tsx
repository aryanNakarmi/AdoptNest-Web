"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiArrowLeft, HiCamera, HiX } from "react-icons/hi";
import { toast } from "react-toastify";
import { uploadReportPhoto, createReport } from "@/lib/api/animal-report/animal-report";

export default function PostReportPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    species: "",
    location: "",
    description: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setPhotoFile(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);

      // Auto-upload the photo
      await uploadPhotoAutomatically(file);
    }
  };

  const uploadPhotoAutomatically = async (file: File) => {
    try {
      setUploading(true);
      const response = await uploadReportPhoto(file);

      if (response.success) {
        setUploadedPhotoUrl(response.data);
        toast.success("Photo uploaded successfully");
      } else {
        toast.error(response.message || "Failed to upload photo");
        setPhotoFile(null);
        setPhotoPreview("");
      }
    } catch (error) {
      toast.error("Failed to upload photo");
      setPhotoFile(null);
      setPhotoPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    setUploadedPhotoUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.species.trim()) {
      toast.error("Please enter animal species");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Please enter location");
      return;
    }

    if (!uploadedPhotoUrl) {
      toast.error("Please upload a photo");
      return;
    }

    try {
      setLoading(true);
      const response = await createReport({
        species: formData.species.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        imageUrl: uploadedPhotoUrl,
      });

      if (response.success) {
        toast.success("Report created successfully!");
        // Redirect to my reports
        router.push("/user/my-reports");
      } else {
        toast.error(response.message || "Failed to create report");
      }
    } catch (error) {
      toast.error("Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      species: "",
      location: "",
      description: "",
    });
    handleRemovePhoto();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
       
        <h1 className="text-3xl font-bold text-gray-900">Report an Animal</h1>
        <p className="text-gray-600 text-sm mt-1">
          Help us locate and assist animals in need
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 shadow">
        {/* Photo Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Photo <span className="text-red-600">*</span>
          </label>

          {photoPreview ? (
            // Photo Preview
            <div className="relative">
              <div className="w-full h-64 relative rounded-xl overflow-hidden">
                <Image
                  src={photoPreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Upload Status */}
              <div className="mt-3">
                {uploading ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <p className="text-sm text-blue-800 font-semibold">Uploading photo...</p>
                  </div>
                ) : uploadedPhotoUrl ? (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-semibold">Photo uploaded successfully</p>
                  </div>
                ) : null}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={uploading}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60"
              >
                <HiX size={20} />
              </button>
            </div>
          ) : (
            // Upload Area
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-red-400 hover:bg-red-50 transition bg-gray-50">
              <HiCamera size={40} className="text-gray-400 mb-3" />
              <p className="text-gray-600 font-semibold text-center mb-1">
                Click to select a photo
              </p>
              <p className="text-gray-500 text-sm text-center">
                or drag and drop (max 5MB)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Species Field */}
        <div>
          <label htmlFor="species" className="block text-sm font-semibold text-gray-900 mb-2">
            Animal Species <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="species"
            name="species"
            value={formData.species}
            onChange={handleInputChange}
            placeholder="e.g., Dog, Cat, Bird, Cow"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition"
          />
        </div>

        {/* Location Field */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
            Location <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Where was the animal spotted?"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition"
          />
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the animal's condition, behavior, distinguishing features, etc."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || !uploadedPhotoUrl}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="flex-1 border border-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Clear Form
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Your report will be reviewed by our team before being published
        </p>
      </form>
    </div>
  );
}