/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { TextField } from "@mui/material";
import React, { useState } from "react";
import { TVideo } from "@/types/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type AddMediaVideoProps = {
  onSuccessClose: () => void;
};

const AddMediaVideo = ({ onSuccessClose }: AddMediaVideoProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<TVideo>>({
    videoUrl: "",
    title: "",
    date: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<TVideo>) => {
      const response = await fetch(
        "https://server.majumdararif.info/api/v1/videos",
        // "http://localhost:5010/api/v1/videos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add video");
      }

      return result.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video added successfully");
      setFormData({
        videoUrl: "",
        title: "",
        date: "", 
      });

      onSuccessClose();
    },

    onError: (error: any) => {
      toast.error(error.message || "Failed to add video");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error(" date is required");
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-[500px] lg:w-[600px] bg-white p-6 rounded-lg text-black">
      <h2 className="text-2xl font-bold text-center mb-8">Add New Video</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Published Date */}
        <div>
          <p className="mb-2 text-gray-800">Select Published Date</p>
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
          required
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleChange}
          label="Video URL"
          fullWidth
          placeholder="YouTube / Facebook URL"
        />

        {/* Title */}
        <TextField
          required
          name="title"
          value={formData.title}
          onChange={handleChange}
          label="Video Title"
          fullWidth
        />

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-orange-600 text-white py-3 rounded active:scale-95 disabled:opacity-50"
        >
          {createMutation.isPending ? "Adding..." : "Add Video"}
        </button>
      </form>
    </div>
  );
};

export default AddMediaVideo;
