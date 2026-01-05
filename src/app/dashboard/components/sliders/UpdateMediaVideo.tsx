/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import useAxiosPublic from "@/axios/useAxiosPublic";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TVideo } from "@/types/types";
import { TextField } from "@mui/material";

interface UpdateVideoProps {
  videoId: string;
  setOpenModalForUpdate: (value: boolean) => void;
}

const UpdateMediaVideo: React.FC<UpdateVideoProps> = ({
  videoId,
  setOpenModalForUpdate,
}) => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  const [formData, setFormData] = useState<Partial<TVideo>>({
    videoUrl: "",
    title: "",
    date: "",
  });

  // 🔹 Fetch single video
  const { data: video, isLoading } = useQuery({
    queryKey: ["video", videoId],
    enabled: !!videoId,
    queryFn: async () => {
      const res = await axiosPublic.get(`/videos/${videoId}`);
      return res.data.data;
    },
  });

  // 🔹 Populate form after fetch
  useEffect(() => {
    if (video) {
      setFormData({
        videoUrl: video.videoUrl || "",
        title: video.title || "",
        date: video.date || "",
      });
    }
  }, [video]);

  // 🔹 Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TVideo>;
    }) => {
      const res = await apiClient.put(`/videos/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video updated successfully");
      setOpenModalForUpdate(false); // ✅ auto close slider
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update video");
    },
  });

  // 🔹 Input change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error("Date is required");
      return;
    }

    updateMutation.mutate({
      id: videoId,
      data: formData,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[500px] lg:w-[600px] bg-white/90 p-6 rounded-lg text-black">
      <h2 className="text-2xl font-bold text-center mb-8">
        Update Video
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <p className="mb-2">Select Published Date</p>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Video URL */}
        <TextField
          name="videoUrl"
          label="Video URL"
          value={formData.videoUrl}
          onChange={handleChange}
          fullWidth
          required
        />

        {/* Title */}
        <TextField
          name="title"
          label="Video Title"
          value={formData.title}
          onChange={handleChange}
          fullWidth
          required
        />

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded active:scale-95 disabled:opacity-50"
        >
          {updateMutation.isPending ? "Updating..." : "Update Video"}
        </button>
      </form>
    </div>
  );
};

export default UpdateMediaVideo;
