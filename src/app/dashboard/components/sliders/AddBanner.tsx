/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Drawer } from "@mui/material";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import apiClient from "@/axios/axiosInstant";
import UploadImageSlider from "./uploadImageSlider/UploadImageSlider";

const AddBannerPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    thumbnailImage: "",
    title: "",
    toptitle: "",
    bottomtitle: "",
    isActive: true,
  });

  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  const handleImageSelect = (url: string) => {
    setImageUrl(url);
    setFormData(prev => ({
      ...prev,
      thumbnailImage: url
    }));
  };

  const addBanner = async () => {
    if (!formData.thumbnailImage) {
      toast.error("Please select an image");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.toptitle.trim()) {
      toast.error("Please enter a top title");
      return;
    }
    if (!formData.bottomtitle.trim()) {
      toast.error("Please enter a bottom title");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/banners", formData);
      toast.success("Banner added successfully");
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      router.push("/dashboard/banner");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add banner");
      console.error("Error adding banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBanner();
  };

  return (
    <div className="bg-white min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Add New Banner</h1>
            <p className="text-gray-600 mt-2">Create a new banner for your website</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Banner Image</h2>
            <div className="flex flex-col items-center">
              {imageUrl ? (
                <div className="relative w-full max-w-2xl h-64 rounded-lg overflow-hidden">
                  <CiEdit
                    className="absolute text-white text-3xl hover:text-gray-200 active:scale-90 right-3 top-3 bg-gray-800/70 p-1 rounded-full z-10 cursor-pointer"
                    onClick={() => toggleDrawer(true)}
                  />
                  <Image
                    alt="Banner Preview"
                    src={imageUrl}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-full max-w-2xl h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => toggleDrawer(true)}
                >
                  <div className="text-center">
                    <div className="text-5xl text-gray-400 mb-3">📷</div>
                    <p className="text-gray-700 font-medium">Click to upload banner image</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: 1920x800px • Max size: 2MB
                    </p>
                  </div>
                </div>
              )}
              {!imageUrl && (
                <button
                  type="button"
                  onClick={() => toggleDrawer(true)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Select Image
                </button>
              )}
              <input
                type="hidden"
                name="thumbnailImage"
                value={formData.thumbnailImage}
                required
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-gray-50 p-6 rounded-lg space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Banner Details</h2>
            
            {/* Top Title */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Top Title *
              </label>
              <input
                type="text"
                name="toptitle"
                value={formData.toptitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter top title (e.g., Welcome to)"
                required
              />
            </div>

            {/* Main Title */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Main Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter main title"
                required
              />
            </div>

            {/* Bottom Title/Description */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Bottom Title/Description *
              </label>
              <textarea
                name="bottomtitle"
                value={formData.bottomtitle}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description or bottom title"
                required
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-3 text-gray-700">
                Active (Show this banner on website)
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                "Add Banner"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Image Upload Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: "60%", md: "40%" } },
        }}
      >
        <UploadImageSlider
          photoId={handleImageSelect}
          toggleDrawer={() => toggleDrawer(false)}
        />
      </Drawer>
    </div>
  );
};

export default AddBannerPage;