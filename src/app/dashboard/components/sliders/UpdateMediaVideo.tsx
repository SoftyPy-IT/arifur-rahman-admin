/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/sliders/UpdateMediaVideo.tsx
"use client";
import React from 'react';
import useAxiosPublic from '@/axios/useAxiosPublic';
import apiClient from '@/axios/axiosInstant';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TVideo } from '@/types/types';
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface UpdateVideoProps {
  videoId: string;
  setOpenModalForUpdate: (value: boolean) => void;
}

const UpdateMediaVideo: React.FC<UpdateVideoProps> = ({ videoId, setOpenModalForUpdate }) => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  // Video folders
  const videoFolders = [
    'Banner',
    'Who We Are',
    'Events',
    'Training',
    'Interviews',
    'Campaign',
    'Other'
  ];

  // Getting video data
  const { data: video, isLoading } = useQuery({
    queryKey: ["video", videoId],
    queryFn: async () => {
      if (!videoId) return null;
      const response = await axiosPublic.get(`/videos/${videoId}`);
      return response.data.data;
    },
    enabled: !!videoId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TVideo> }) => {
      const response = await apiClient.put(`/videos/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video updated successfully');
      setOpenModalForUpdate(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update video');
      console.error('Update error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data: Partial<TVideo> = {
      folder: formData.get('folder') as string,
      videoUrl: formData.get('videoUrl') as string,
      title: formData.get('title') as string,
    };

    updateMutation.mutate({ id: videoId, data });
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[500px] text-black bg-white/90 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Update Video
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl 2xl:mt-10 px-6 pt-4 flex flex-col gap-8 justify-between items-center pb-12">
          <section className="flex flex-col lg:flex-row gap-12 w-full">
            {/* Left side: Form fields */}
            <div className="flex flex-col gap-6 w-full">
              {/* Folder */}
              <FormControl fullWidth>
                <InputLabel>Folder</InputLabel>
                <Select
                  name="folder"
                  defaultValue={video?.folder || 'Banner'}
                  label="Folder"
                  required
                >
                  {videoFolders.map((folder) => (
                    <MenuItem key={folder} value={folder}>
                      {folder}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Video URL */}
              <TextField
                required
                name="videoUrl"
                defaultValue={video?.videoUrl || ''}
                label="Video URL"
                variant="outlined"
                fullWidth
                helperText="Enter YouTube or Facebook video URL"
              />

              {/* Title */}
              <TextField
                required
                name="title"
                defaultValue={video?.title || ''}
                label="Video Title"
                variant="outlined"
                fullWidth
                placeholder="Enter video title"
              />
            </div>

            
          </section>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMediaVideo;