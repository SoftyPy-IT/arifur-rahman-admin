/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Drawer } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import apiClient from "@/axios/axiosInstant";
import UploadImageSlider from "./uploadImageSlider/UploadImageSlider"; // Add this import

interface AddBannerSliderProps {
  setOpenModalForAdd: (value: boolean) => void;
  onSuccess?: () => void;
}

interface Banner {
  _id: string;
  thumbnailImage: string;
  title: string;
  toptitle: string;
  bottomtitle: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AddBannerSlider: React.FC<AddBannerSliderProps> = ({ 
  setOpenModalForAdd,
  onSuccess 
}) => {
  const queryClient = useQueryClient();
  const [openImageDrawer, setOpenImageDrawer] = useState(false); // Change variable name for clarity
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    thumbnailImage: "",
    title: "",
    toptitle: "",
    bottomtitle: "",
    isActive: true,
  });

  const toggleImageDrawer = (newOpen: boolean) => setOpenImageDrawer(newOpen);

  const handleImageSelect = async (photoId: string) => {
    try {
      // Check if it's already a URL
      if (photoId.startsWith('http')) {
        setImageUrl(photoId);
        setFormData(prev => ({
          ...prev,
          thumbnailImage: photoId
        }));
        return;
      }
      
      // If it's a photo ID, fetch the image URL
      const response = await apiClient.get(`/photos/${photoId}`);
      const url = response?.data?.data?.imageUrl;
      
      if (url) {
        setImageUrl(url);
        setFormData(prev => ({
          ...prev,
          thumbnailImage: url
        }));
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      toast.error("Failed to load selected image");
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate required fields
  if (!formData.thumbnailImage) {
    toast.error("Please select or enter a banner image");
    return;
  }
  
  if (!formData.title.trim()) {
    toast.error("Main title is required");
    return;
  }
  
  setLoading(true);
  
  try {
    // Send API request
    const response = await apiClient.post("/banners", formData);
    const newBanner = response.data.data;
    
    // ✅ CRITICAL FIX: Update cache IMMEDIATELY
    queryClient.setQueryData(['banners'], (oldBanners: Banner[] = []) => {
      return [newBanner, ...oldBanners];
    });
    
    toast.success("Banner added successfully ✅");
    
    // ✅ Call onSuccess FIRST (triggers query invalidation)
    if (onSuccess) {
      onSuccess();
    }
    
    // ✅ Small delay for UI feedback before closing
    setTimeout(() => {
      setOpenModalForAdd(false);
    }, 400);
    
  } catch (error: any) {
    console.error("Add banner error:", error);
    
    // ✅ Rollback cache on error
    queryClient.invalidateQueries({ queryKey: ["banners"] });
    
    // Show error message
    const errorMsg = error.response?.data?.message || 
                     error.response?.data?.error || 
                     "Failed to add banner";
    toast.error(errorMsg);
    
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="h-full min-h-screen text-black">
      {/* Fixed header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setOpenModalForAdd(false)} 
          className="text-rose-600 px-3 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 items-center justify-center bg-white"
        >
          <span className="text-xl"><CiEdit /></span>
          <p>Back</p>
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          Add New Banner
        </h2>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>

      {/* Content area with scroll */}
      <div className="overflow-y-auto h-[calc(100vh-80px)] px-4 md:px-8 py-6">
        {/* Image Upload Drawer */}
        <Drawer 
          anchor="right" 
          open={openImageDrawer} 
          onClose={() => toggleImageDrawer(false)}
          PaperProps={{
            sx: { 
              width: { xs: "100%", sm: "80%", md: "70%", lg: "60%" },
              maxWidth: "1000px"
            },
          }}
        >
          <UploadImageSlider
            photoId={handleImageSelect}
            toggleDrawer={() => toggleImageDrawer(false)}
          />
        </Drawer>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Banner Image</h3>
              <div className="flex flex-col items-center">
                {imageUrl ? (
                  <div className="relative w-full max-w-2xl h-64 rounded-lg overflow-hidden mb-4">
                    <CiEdit
                      className="absolute text-white text-3xl hover:text-gray-200 active:scale-90 right-3 top-3 bg-gray-800/70 p-1 rounded-full cursor-pointer z-10"
                      onClick={() => toggleImageDrawer(true)}
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
                    className="w-full max-w-2xl h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
                    onClick={() => toggleImageDrawer(true)}
                  >
                    <div className="text-center">
                      <div className="text-5xl text-gray-400 mb-3">📷</div>
                      <p className="text-gray-700 font-medium">Click to select banner image</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: 1920x800px
                      </p>
                    </div>
                  </div>
                )}
                
             
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Banner Details</h3>
              
              {/* Top Title */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Top Title
                </label>
                <input
                  type="text"
                  name="toptitle"
                  value={formData.toptitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter top title (e.g., Welcome to)"
                />
              </div>

              {/* Main Title */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Main Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter main title"
                />
              </div>

              {/* Bottom Title/Description */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Bottom Title/Description
                </label>
                <textarea
                  name="bottomtitle"
                  value={formData.bottomtitle}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter description or bottom title"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center pt-2">
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

            {/* Action Buttons - Fixed at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 md:-mx-8 px-4 md:px-8 py-4">
              <div className="max-w-4xl mx-auto flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setOpenModalForAdd(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBannerSlider;