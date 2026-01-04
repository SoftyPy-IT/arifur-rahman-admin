/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Drawer } from "@mui/material";
import React, { useEffect, useState } from "react";
import useAxiosPublic from "@/axios/useAxiosPublic";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TPhotoCard } from "@/types/types";
import UploadImageSlider from "../../components/sliders/uploadImageSlider/UploadImageSlider";

interface UpdatePhotoCardProps {
  photoCardId: string;
  setOpenModalForUpdate: (value: boolean) => void;
}

const UpdatePhotoCard: React.FC<UpdatePhotoCardProps> = ({
  photoCardId,
  setOpenModalForUpdate,
}) => {
  const queryClient = useQueryClient();
  const [photoCard, setPhotoCard] = useState<TPhotoCard | null>(null);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [photoId, setPhotoId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  // Fetch photo card data
  useEffect(() => {
    if (!photoCardId) return;

    const getPhotoCardData = async () => {
      try {
        setLoading(true);
        const response = await axiosPublic.get(`/photoCards/${photoCardId}`);
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setPhotoCard(data);
          setImageUrl(data.imageUrl);
          setTitle(data.title);
          setDate(data.date ? new Date(data.date).toISOString().split("T")[0] : "");
        }
      } catch (error) {
        console.error("Error fetching photo card data:", error);
        toast.error("Failed to load photo card");
      } finally {
        setLoading(false);
      }
    };

    getPhotoCardData();
  }, [photoCardId, axiosPublic]);

  // Fetch new photo when photoId changes
  useEffect(() => {
    if (!photoId) return;

    const fetchPhotoData = async () => {
      try {
        const response = await axiosPublic.get(`/photos/${photoId}`);
        setImageUrl(response?.data?.data?.imageUrl || imageUrl);
      } catch (error) {
        console.error("Error fetching photo data:", error);
        toast.error("Failed to load photo");
      }
    };

    fetchPhotoData();
  }, [photoId, axiosPublic, imageUrl]);

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<TPhotoCard>) => {
      const response = await apiClient.patch(`/photoCards/${photoCardId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Photo card updated successfully");
      queryClient.invalidateQueries({ queryKey: ["photoCards"] });
      setOpenModalForUpdate(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update photo card");
      console.error("Update error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!date) {
      toast.error("Date is required");
      return;
    }

    const data: Partial<TPhotoCard> = {
      title: title.trim(),
      date: date,
      imageUrl: imageUrl,
    };

    updateMutation.mutate(data);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading photo card...</p>
        </div>
      </div>
    );
  }

  if (!photoCard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Photo Card Not Found</h2>
        <p className="text-gray-600">The photo card you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px]">
      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl 2xl:mt-28 px-6 pt-10 flex flex-col gap-10 justify-between items-center pb-20 text-black">
          <section className="flex flex-col lg:flex-row gap-16">
            {/* Left Panel: Image, Title, , Date */}
            <div className="flex flex-col gap-[20px]">
              <div className="w-full flex justify-center">
                {photoId ? (
                  <div className="w-[150px] h-[150px] rounded-full relative">
                    <CiEdit
                      className="absolute text-red-600 text-4xl hover:text-red-800 active:scale-90 right-0 top-0 bg-white rounded-full"
                      onClick={() => toggleDrawer(true)}
                    />
                    <Image
                      alt="Event Photo"
                      src={imageUrl as string}
                      height={600}
                      width={800}
                      className="w-[150px] h-[150px] rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-[150px] h-[150px] rounded-full relative">
                    <CiEdit
                      className="absolute text-red-600 text-4xl hover:text-red-800 active:scale-90 right-0 top-0 bg-white rounded-full"
                      onClick={() => toggleDrawer(true)}
                    />
                    <Image
                      alt="Event Placeholder"
                      src={photoCard?.imageUrl || "/placeholder.jpg"}
                      height={600}
                      width={800}
                      className="w-[150px] h-[150px] rounded-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="title">Title</label>
                <input
                  defaultValue={photoCard?.title}
                  name="title"
                  className="md:w-[350px] px-5 py-3 border outline-blue-400 w-[250px] bg-white"
                  type="text"
                />
              </div>

              <label htmlFor="Date">
                <p className="text-gray-950 mb-1">Select Date</p>
                <input
                  name="date"
                  defaultValue={
                    photoCard?.date && !isNaN(new Date(photoCard?.date).getTime())
                      ? new Date(photoCard?.date).toISOString().split("T")[0]
                      : ""
                  }
                  type="date"
                  className="md:w-[350px] w-[250px] bg-white py-3 text-gray-700 px-3"
                />
              </label>
            </div>
          </section>

          <input
            type="submit"
            value="Submit"
            className="md:w-[350px] text-white w-[250px] bg-orange-600 py-2 px-3 active:scale-95 lg:w-full"
          />
        </div>
      </form>
    </div>
  );
};

export default UpdatePhotoCard;
