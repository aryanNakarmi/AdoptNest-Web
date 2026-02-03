"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { z } from "zod";

const updateUserSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.instanceof(File).optional(),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

export default function UpdateUserForm({ user }: { user: any }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<UpdateUserData>({
      resolver: zodResolver(updateUserSchema),
      values: {
        fullName: user?.fullName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
      }
    });

  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
      setFileName(file.name);
    } else {
      setPreviewImage(null);
      setFileName(null);
    }
    onChange(file);
  };

  const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
    setPreviewImage(null);
    setFileName(null);
    onChange?.(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: UpdateUserData) => {
    setError(null);
    try {
      const formData = new FormData();
      if (data.fullName) formData.append('fullName', data.fullName);
      if (data.email) formData.append('email', data.email);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      if (data.profilePicture) formData.append('profilePicture', data.profilePicture);

      const response = await handleUpdateProfile(formData);

      if (!response.success) throw new Error(response.message || 'Update profile failed');

      handleDismissImage();
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (error: Error | any) {
      toast.error(error.message || 'Profile update failed');
      setError(error.message || 'Profile update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Update Profile</h1>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Profile Image */}
        <div className="flex flex-col items-center gap-3">
          {previewImage ? (
            <div className="relative w-28 h-28">
              <img
                src={previewImage}
                alt="Profile Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-red-400"
              />
              <Controller
                name="profilePicture"
                control={control}
                render={({ field: { onChange } }) => (
                  <button
                    type="button"
                    onClick={() => handleDismissImage(onChange)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                )}
              />
            </div>
          ) : user?.profilePicture ? (
            <Image
              src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
              alt="Profile"
              width={112}
              height={112}
              className="w-28 h-28 rounded-full object-cover border-2 border-red-400"
            />
          ) : (
            <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
              <span className="text-gray-500 font-medium">No Image</span>
            </div>
          )}

          {/* Custom File Input */}
          <Controller
            name="profilePicture"
            control={control}
            render={({ field: { onChange } }) => (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition shadow-md"
                >
                  Choose File
                </button>
                <span className="text-gray-700 font-medium">{fileName || "No file chosen"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
              </div>
            )}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-900"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-900"
          />
          {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-800">Phone Number</label>
          <input
            type="text"
            {...register("phoneNumber")}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-900"
          />
          {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition disabled:opacity-60 shadow-md"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
