"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiCamera, HiX } from "react-icons/hi";
import { toast } from "react-toastify";
import { uploadReportPhoto, createReport } from "@/lib/api/animal-report/animal-report";
import MapLocationPicker from "./_components/MapLocationPicker";


interface LocationValue {
  address: string;
  lat: number;
  lng: number;
}

export default function PostReportPage() {
  const router = useRouter();

  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size must be less than 5MB"); return; }

    setPhotoPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const response = await uploadReportPhoto(file);
      if (response.success) {
        setUploadedPhotoUrl(response.data);
        toast.success("Photo uploaded successfully");
      } else {
        toast.error(response.message || "Failed to upload photo");
        setPhotoPreview("");
      }
    } catch {
      toast.error("Failed to upload photo");
      setPhotoPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    setUploadedPhotoUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!species.trim()) { toast.error("Please enter animal species"); return; }
    if (!location) { toast.error("Please select a location on the map"); return; }
    if (!uploadedPhotoUrl) { toast.error("Please upload a photo"); return; }

    try {
      setLoading(true);
      const response = await createReport({
        species: species.trim(),
        location: {
          address: location.address,
          lat: location.lat,
          lng: location.lng,
        },
        description: description.trim(),
        imageUrl: uploadedPhotoUrl,
      });

      if (response.success) {
        toast.success("Report created successfully!");
        router.push("/user/my-reports");
      } else {
        toast.error(response.message || "Failed to create report");
      }
    } catch {
      toast.error("Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSpecies("");
    setLocation(null);
    setDescription("");
    handleRemovePhoto();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Report an Animal</h1>
        <p className="text-gray-600 text-sm mt-1">Help us locate and assist animals in need</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 shadow">

        {/* Photo */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Photo <span className="text-red-600">*</span>
          </label>

          {photoPreview ? (
            <div className="relative">
              <div className="w-full h-64 relative rounded-xl overflow-hidden">
                <Image src={photoPreview} alt="Preview" fill className="object-cover" />
              </div>
              <div className="mt-3">
                {uploading ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <p className="text-sm text-blue-800 font-semibold">Uploading photo...</p>
                  </div>
                ) : uploadedPhotoUrl ? (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 font-semibold">✓ Photo uploaded successfully</p>
                  </div>
                ) : null}
              </div>
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
            <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-red-400 hover:bg-red-50 transition bg-gray-50">
              <HiCamera size={40} className="text-gray-400 mb-3" />
              <p className="text-gray-600 font-semibold text-center mb-1">Click to select a photo</p>
              <p className="text-gray-500 text-sm text-center">or drag and drop (max 5MB)</p>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Animal Species <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="e.g., Dog, Cat, Bird, Cow"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition"
          />
        </div>

        {/* Location — Google Maps picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Location <span className="text-red-600">*</span>
          </label>
          <MapLocationPicker value={location} onChange={setLocation} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the animal's condition, behavior, distinguishing features, etc."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-red-500 focus:outline-none transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploading || !uploadedPhotoUrl || !location}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
          <button
            type="button"
            onClick={handleClear}
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