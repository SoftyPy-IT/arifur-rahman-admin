/* eslint-disable @typescript-eslint/no-explicit-any */

import { Drawer } from '@mui/material';
import React, { useEffect, useState } from 'react';
import UploadImageSlider from './uploadImageSlider/UploadImageSlider';
import useAxiosPublic from '@/axios/useAxiosPublic';
import Image from 'next/image';
import { TBiography } from '@/types/types';
import {  CiEdit } from 'react-icons/ci';
import apiClient from '@/axios/axiosInstant';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateBiographyInfoProps {
  bioId: string;
  setOpenModalMainForUpdate:(value:boolean)=>void
}

const UpdateBiographyInfo: React.FC<UpdateBiographyInfoProps> = ({ bioId,setOpenModalMainForUpdate }) => {
  const queryClient = useQueryClient();
  const [biography, setBiography] = useState<TBiography | null>(null);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [photoId, setPhotoId] = useState('');
  const axiosPublic = useAxiosPublic();
 console.log(biography)
  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  useEffect(() => {
   

    const getEventData = async () => {
      try {
        const response = await axiosPublic.get(`/biography`);
        setBiography(response.data.data);
        setImageUrl(response.data.data.imageUrl);
      } catch (error) {
        console.error('Error fetching  data:', error);
      }
    };

    getEventData();
  }, [bioId, axiosPublic]);

  useEffect(() => {
    if (!photoId) return;

    const fetchPhotoData = async () => {
      try {
        const response = await axiosPublic.get(`/photos/${photoId}`);
        setImageUrl(response?.data?.data?.imageUrl);
      } catch (error) {
        console.error('Error fetching photo data:', error);
      }
    };

    fetchPhotoData();
  }, [photoId, axiosPublic]);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TBiography> }) => {
      const response = await apiClient.patch(`/biography/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biography'] });
      toast.success('Updated Successfully');
      setOpenModalMainForUpdate(false)
    },
    onError: (error: any) => {
      toast.error(error.response.data.message||'Failed to update');
      console.error('Update error:', error);
    },
  });

  const handleSubmit = (e: { preventDefault: () => void; target: any; } ) => {
    e.preventDefault();
    const form = e.target;

    const data: Partial<TBiography> = {
      title: form.title.value,
      shortDescription: form.shortDescription.value,
      imageUrl,
    };

    updateMutation.mutate({ id:bioId, data });
    form.reset();

  };

  return (
    <div className="h-full min-h-[500px] text-black">
      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl 2xl:mt-28 px-6 pt-10 flex flex-col gap-10 justify-between items-center pb-20 text-black">
          <section className="flex flex-col lg:flex-row gap-16">
            {/* Left Panel: Image, Title, Location, Date */}
            <div className="flex flex-col gap-[20px]">
              <div className="w-full flex justify-center">
                {photoId ? (
                  <div className="w-[150px] h-[150px] rounded-full relative">
                 
                    <CiEdit
                      className="absolute text-red-600 text-4xl hover:text-red-800 active:scale-90 right-0 top-0 bg-white rounded-full"
                      onClick={() => toggleDrawer(true)}
                    />
                    <Image
                      alt="Photo"
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
                      alt="photo"
                      src={biography?.imageUrl as string}
                      height={600}
                      width={800}
                      className="w-[150px] h-[150px] rounded-full"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-3">
                <label htmlFor="title">Title</label>
                <input
                  required
                  defaultValue={biography?.title}
                  name="title"
                  className="md:w-[350px] px-5 py-3 border outline-blue-400 w-[250px] bg-white"
                  type="text"
                />
              </div>

            </div>

            {/* Right Panel: Description */}
            <div className="flex flex-col gap-1">
              <label htmlFor="description">Short Description</label>
              <textarea
                required
                defaultValue={biography?.shortDescription}
                name="shortDescription"
                className="md:w-[350px] w-[250px] bg-white p-5 border outline-blue-400"
                rows={8}
              />
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

export default UpdateBiographyInfo;

