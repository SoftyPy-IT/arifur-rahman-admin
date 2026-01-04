/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Drawer } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAxiosPublic from "@/axios/useAxiosPublic";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UploadImageSlider from "@/app/dashboard/components/sliders/uploadImageSlider/UploadImageSlider";
import MillatEditor from "@/app/dashboard/components/sliders/JodiEditor";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { TManifesto } from "@/types/types";

const UpdateManifesto = () => {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  const [manifesto, setManifesto] = useState<TManifesto | null>(null);
  const [photoId, setPhotoId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [pdfLinks, setPdfLinks] = useState<{ name: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    date: "",
  });
  
  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  // Fetch manifesto data
  useEffect(() => {
    if (!id) {
      console.error("No ID in URL params");
      toast.error("No manifesto ID provided");
      router.push("/dashboard/manifestos");
      return;
    }
    
    const fetchManifesto = async () => {
      try {
        setIsLoading(true);
        console.log("Attempting to fetch manifesto with ID:", id);
        
        // Test the API endpoint first
        console.log("API Base URL:", axiosPublic.defaults.baseURL);
        
        const res = await axiosPublic.get(`/manifestos/${id}`);
        console.log("API Response Status:", res.status);
        console.log("API Response Data:", res.data);
        
        if (res.data.success === false) {
          console.error("API returned false success:", res.data.message);
          toast.error(res.data.message || "Manifesto not found");
          router.push("/dashboard/manifestos");
          return;
        }
        
        if (!res.data.data) {
          console.error("No data in response");
          toast.error("No manifesto data received");
          router.push("/dashboard/manifestos");
          return;
        }
        
        const manifestData = res.data.data;
        console.log("Manifesto data received:", manifestData);
        
        setManifesto(manifestData);
        setDescription(manifestData.description || "");
        setImageUrl(manifestData.imageUrl || "");
        setPdfLinks(manifestData.pdfLinks || []);
        
        // Set form data
        setFormData({
          title: manifestData.title || "",
          shortDescription: manifestData.shortDescription || "",
          date: formatDateForInput(manifestData.date) || "",
        });
        
        console.log("Form data set:", {
          title: manifestData.title,
          date: manifestData.date,
          formattedDate: formatDateForInput(manifestData.date)
        });
        
      } catch (error: any) {
        console.error("Error fetching manifesto:", error);
        
        // More detailed error logging
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
          console.error("Response headers:", error.response.headers);
          
          if (error.response.status === 404) {
            toast.error("Manifesto not found (404)");
          } else if (error.response.status === 500) {
            toast.error("Server error (500)");
          } else {
            toast.error(`Error ${error.response.status}: ${error.response.data?.message || "Unknown error"}`);
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          toast.error("No response from server");
        } else {
          console.error("Error setting up request:", error.message);
          toast.error("Failed to load manifesto: " + error.message);
        }
        
        router.push("/dashboard/manifestos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchManifesto();
  }, [id, axiosPublic, router]);

  // Format date for input field
  const formatDateForInput = (dateString?: string | Date) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date string:", dateString);
        return "";
      }
      
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateString);
      return "";
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TManifesto>) => {
      console.log("Sending update data:", data);
      const res = await apiClient.patch(`/manifestos/${id}`, data); 
      return res.data;
    },
    onSuccess: () => {
      toast.success("Manifesto updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["manifestos"] });
      router.push("/dashboard/Manifesto");
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update manifesto");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!manifesto) {
      toast.error("No manifesto data loaded");
      return;
    }

    const updateData: Partial<TManifesto> = {
      title: formData.title,
      shortDescription: formData.shortDescription,
      description,
      date: formData.date,
      imageUrl: imageUrl || manifesto.imageUrl,
      pdfLinks: pdfLinks.filter(link => link.name.trim() && link.url.trim()),
    };

    console.log("Submitting update:", updateData);
    updateMutation.mutate(updateData);
  };

  const addPdfLink = () => {
    setPdfLinks([...pdfLinks, { name: "", url: "" }]);
  };

  const removePdfLink = (index: number) => {
    setPdfLinks(pdfLinks.filter((_, i) => i !== index));
  };

  const updatePdfLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...pdfLinks];
    newLinks[index][field] = value;
    setPdfLinks(newLinks);
  };


  useEffect(() => {
      if (!photoId) return;
  
      const fetchPhotoData = async () => {
        try {
          const response = await axiosPublic.get(`/photos/${photoId}`);
          setImageUrl(response?.data?.data?.imageUrl);
        } catch (error) {
          console.error("Error fetching photo data:", error);
        }
      };
  
      fetchPhotoData();
    }, [photoId, axiosPublic]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading manifesto data...</p>
         
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 text-black">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            
            <h1 className="text-3xl font-bold text-gray-800 mt-2">Update Manifesto</h1>
          
          </div>
        </div>
      </div>

      
      {/* Image Upload Drawer */}
      <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>

      {manifesto ? (
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"/>

            <div className="p-6 md:p-8">
              {/* Top Section: Photo + Basic Info */}
              <div className="flex flex-col lg:flex-row gap-8 mb-10">
                {/* Photo Section */}
                <div className="lg:w-1/2 flex justify-center">
                  <div className="relative group">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                      <CiEdit
                        className="absolute top-2 right-2 z-10 text-white text-3xl hover:text-gray-300 active:scale-90 cursor-pointer bg-blue-600 p-1 rounded-full"
                        onClick={() => toggleDrawer(true)}
                      />
                      <Image
                        src={imageUrl || manifesto?.imageUrl || "/placeholder.jpg"}
                        alt="Manifesto Cover"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="192px"
                      />
                    </div>
                  </div>
                </div>

                {/* Title, Date, Short Description */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-700 font-medium">Title *</label>
                    <input
                      required
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter manifesto title"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-gray-700 font-medium">Publish Date *</label>
                    <input
                      name="date"
                      required
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-gray-700 font-medium">Short Description *</label>
                    <input
                      required
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Brief description for the manifesto"
                    />
                  </div>
                </div>
              </div>

              {/* PDF Links Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">PDF Documents</h3>
                    <p className="text-gray-600 text-sm">Add related PDF documents for download</p>
                  </div>
                  <button
                    type="button"
                    onClick={addPdfLink}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <span className="text-xl">+</span>
                    Add PDF
                  </button>
                </div>

                <div className="space-y-3">
                  {pdfLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg border"
                    >
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => updatePdfLink(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="Document name"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updatePdfLink(index, 'url', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com/document.pdf"
                      />
                      <button
                        type="button"
                        onClick={() => removePdfLink(index)}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {pdfLinks.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500">No PDF documents added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Editor */}
              <div className="mb-8">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Detailed Description *</h3>
                  <p className="text-gray-600 text-sm">Write the complete manifesto content</p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <MillatEditor
                    value={description}
                    onChange={setDescription}
                    name="description"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3.5 px-6 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Updating...
                    </span>
                  ) : (
                    "Update Manifesto"
                  )}
                </button>
                <Link href="/dashboard/manifestos" className="flex-1">
                  <button
                    type="button"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3.5 px-6 rounded-lg font-semibold text-lg transition-all duration-200 border"
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Manifesto Not Found</h2>
            <p className="text-gray-600 mb-2">The manifesto with ID <code className="bg-gray-100 px-2 py-1 rounded">{id}</code> could not be found.</p>
            <p className="text-gray-500 text-sm mb-6">It may have been deleted or the ID is incorrect.</p>
            <Link href="/dashboard/manifestos">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium">
                Back to Manifestos
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateManifesto;