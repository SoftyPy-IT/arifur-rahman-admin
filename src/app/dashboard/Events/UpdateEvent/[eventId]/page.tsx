"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Drawer } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useAxiosPublic from '@/axios/useAxiosPublic';
import Image from 'next/image';
import { TEvent } from '@/types/types';
import { CiEdit } from 'react-icons/ci';
import apiClient from '@/axios/axiosInstant';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import UploadImageSlider from '@/app/dashboard/components/sliders/uploadImageSlider/UploadImageSlider';
import MillatEditor from '@/app/dashboard/components/sliders/JodiEditor';
import Link from 'next/link';
import { FaArrowAltCircleRight } from 'react-icons/fa';


const UpdateEventInfo = () => {
  const router = useRouter();
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [event, setEvent] = useState<TEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [photoId, setPhotoId] = useState('');
  const axiosPublic = useAxiosPublic();
  const [description, setDescription] = useState("");
  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  useEffect(() => {
    if (!eventId) return;

    const getEventData = async () => {
      try {
        const response = await axiosPublic.get(`/events/${eventId}`);
        setEvent(response.data.data);
        setImageUrl(response.data.data.imageUrl);
        setDescription(response.data.data.description);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    getEventData();
  }, [eventId, axiosPublic]);

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
    mutationFn: async ({ id, data }: { id: string; data: Partial<TEvent> }) => {
      const response = await apiClient.patch(`/events/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event Updated Successfully');
      router.push("/dashboard/Events");

    },
    onError: (error: any) => {
      toast.error(error.response.data.message || 'Failed to update event');
      console.error('Update error:', error);
    },
  });

  const handleSubmit = (e: { preventDefault: () => void; target: any; }) => {
    e.preventDefault();
    const form = e.target;
    const data: Partial<TEvent> = {
      title: form.title.value,
      shortDescription: form.shortDescription.value,
      description,
      location: form.location.value,
      date: form.date.value,
      imageUrl,
    };

    updateMutation.mutate({ id: eventId as string, data });
    form.reset();

  };

  return (
    <div className="h-full min-h-[500px] text-black">
      <Link href={"/dashboard/Events"}>
        <button className='text-rose-600 px-3 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white '><span className='  text-xl '><FaArrowAltCircleRight /></span> <p>Back</p></button>
      </Link>
      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-full 2xl:mt-28 px-6 pt-10 flex flex-col lg:flex-row gap-10 justify-between items-center pb-20 text-black">
          <section className="flex flex-col lg:flex-row gap-16 w-full">
            {/* Left Panel: Image, Title, Location, Date */}
            <div className="flex flex-col gap-[20px]">
              <div className="w-full flex justify-center">
                {photoId ? (
                  <div className="w-full rounded-full relative">
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
                      src={event?.imageUrl || '/placeholder.jpg'}
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
                  required
                  defaultValue={event?.title}
                  name="title"
                  className=" px-5 py-3 border outline-blue-400 w-full bg-white"
                  type="text"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="location">Location</label>
                <input
                  required
                  defaultValue={event?.location}
                  name="location"
                  className="w-full px-5 py-3 border outline-blue-400  bg-white"
                  type="text"
                />
              </div>

              <label htmlFor="date">
                <p className="text-gray-950 mb-1">Select Event Date</p>
                <input
                  name="date"
                  required
                  defaultValue={
                    event?.date && !isNaN(new Date(event.date).getTime())
                      ? new Date(event.date).toISOString().split('T')[0]
                      : ''
                  }
                  type="date"
                  className="md:w-[350px] w-[250px] bg-white py-3 text-gray-700 px-3"
                />
              </label>
            </div>


          </section>


          {/* short description and  description field  */}
          <div className='w-full bg-white '>
            <label htmlFor="title">Short Description</label>
            <input
              required
              defaultValue={event?.shortDescription}
              name="shortDescription"
              className=" px-5 py-3 border mb-5 outline-blue-400 w-full bg-white"
              type="text"
            />
            <MillatEditor
              name="description"
              value={description}
              onChange={setDescription}
            />
          </div>





        </div>
        <div className='w-full px-10'>
          <input

            type="submit"
            value="Submit"
            className=" text-white mb-24  bg-orange-600 py-2 px-3 active:scale-95 w-full"
          />
        </div>
      </form>
    </div>



  );
};

export default UpdateEventInfo;
