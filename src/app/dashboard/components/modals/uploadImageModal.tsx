"use client";
import apiClient from "@/axios/axiosInstant";
import { folderOptions } from "@/utils/folderOption";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadImageModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [images, setImages] = useState<File[]>([]);
  const [folder, setFolder] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post("photos/create-photo", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
      setFileNames([]);
      setImages([]);
      setFolder("");
      setUploadProgress(0);
      onClose();
      toast.success("Images uploaded successfully!");
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error("Failed to upload images");
      console.log(error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      
      // Limit to 10 images
      if (selectedFiles.length > 10) {
        Swal.fire({
          icon: "warning",
          title: "Too many files",
          text: "You can upload maximum 10 images at once",
          showConfirmButton: false,
          timer: 2000,
        });
        return;
      }
      
      // Validate file types
      const validFiles = selectedFiles.filter(file => 
        file.type.startsWith('image/')
      );
      
      if (validFiles.length !== selectedFiles.length) {
        Swal.fire({
          icon: "warning",
          title: "Invalid files",
          text: "Some files are not valid images",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      
      setImages(validFiles);
      setFileNames(validFiles.map((file) => file.name));
    } else {
      setImages([]);
      setFileNames([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0 || !folder) {
      Swal.fire({
        icon: "warning",
        text: "Please select images and a folder",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const formData = new FormData();
    
    // Append each file individually (Multer expects 'file' field for each file)
    images.forEach((image) => {
      formData.append("file", image); // This works because Multer handles array
    });
    
    // Append folder data
    formData.append("data", JSON.stringify({ folder }));

    uploadMutation.mutate(formData);
  };

  // Remove a single image
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newFileNames = [...fileNames];
    
    newImages.splice(index, 1);
    newFileNames.splice(index, 1);
    
    setImages(newImages);
    setFileNames(newFileNames);
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 text-black">
      <div className="bg-white shadow-2xl w-11/12 max-w-2xl p-8 relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Upload Images
        </h2>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div
            onClick={() => document.getElementById("file-input")?.click()}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <Image
              alt="upload"
              src="/Images/uploadImageLogo.jpg"
              height={100}
              width={100}
              className="w-[80px] h-[80px] mb-4"
            />
            <p className="text-gray-600 text-center mb-2">
              Click to select images
            </p>
            <p className="text-gray-500 text-sm text-center">
              You can select up to 10 images at once
            </p>
          </div>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Selected Files Preview */}
          {fileNames.length > 0 && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium text-gray-700 mb-2">
                Selected Images ({fileNames.length}/10)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {fileNames.map((name, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-sm text-gray-600 truncate">{name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Folder *
            </label>
            <select
              required
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={uploadMutation.isPending}
            >
              <option value="" disabled>
                Select a folder
              </option>
              {folderOptions.map((option, index) => (
                <option
                  key={index}
                  value={option.folder}
                  hidden={option.folder === "All Photos"}
                >
                  {option.folder}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              disabled={uploadMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={uploadMutation.isPending || images.length === 0 || !folder}
            >
              {uploadMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading ({uploadProgress}%)</span>
                </div>
              ) : (
                <span>Upload {images.length} Image{images.length !== 1 ? 's' : ''}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default UploadImageModal;