/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/sliders/AddMediaVideo.tsx
"use client";
import { TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import React, { useState } from 'react';
import { TVideo } from '@/types/types';
import apiClient from '@/axios/axiosInstant';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AddMediaVideo = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    folder: 'Banner',
    videoUrl: '',
    title: '',
  });

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

 // src/components/sliders/AddMediaVideo.tsx
const createMutation = useMutation({
  mutationFn: async (data: Partial<TVideo>) => {
    console.log('📡 Sending data to:', `${apiClient.defaults.baseURL}/videos`);
    console.log('Data to send:', data);
    
    try {
      // Use fetch instead of apiClient to debug
      const response = await fetch('https://server.majumdararif.info/api/v1/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      // Try to parse as JSON
      try {
        const result = JSON.parse(responseText);
        console.log('Parsed result:', result);
        return result.data;
      } catch {
        throw new Error('Invalid JSON response');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['videos'] });
    setFormData({
      folder: 'Banner',
      videoUrl: '',
      title: '',
    });
    toast.success("Video added successfully");
  },
  onError: (error: any) => {
    console.error('Full error:', error);
    toast.error(error.message || 'Failed to add video');
  },
});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className=' min-h-[500px] lg:w-[600px] bg-white/90 p-6 rounded-lg'>
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Add New Video
      </h2>

      <form onSubmit={handleSubmit}>
        <div className='max-w-4xl 2xl:mt-10 px-6 pt-4 flex flex-col gap-8 justify-between items-center pb-12'>
          <section className='flex flex-col lg:flex-row gap-12 w-full'>
            {/* Left side: Form fields */}
            <div className='flex flex-col gap-6 w-full'>
              {/* Folder */}
              <FormControl fullWidth>
                <InputLabel>Folder</InputLabel>
                <Select
                  name="folder"
                  value={formData.folder}
                  onChange={handleSelectChange}
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
                value={formData.videoUrl}
                onChange={handleChange}
                name="videoUrl"
                label="Video URL"
                variant="outlined"
                fullWidth
                placeholder="Enter YouTube or Facebook video URL"
                helperText="Paste any YouTube or Facebook video link"
              />

              {/* Title */}
              <TextField
                required
                value={formData.title}
                onChange={handleChange}
                name="title"
                label="Video Title"
                variant="outlined"
                fullWidth
                placeholder="Enter video title"
              />
            </div>

            
          </section>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full max-w-md bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Adding Video...' : 'Add Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMediaVideo;