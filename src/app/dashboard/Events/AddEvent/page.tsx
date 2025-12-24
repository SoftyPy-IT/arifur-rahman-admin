"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import useAxiosPublic from "@/axios/useAxiosPublic";
import Image from "next/image";
import { TEvent, TPhoto } from "@/types/types";
import { CiCircleRemove } from "react-icons/ci";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UploadImageSlider from "../../components/sliders/uploadImageSlider/UploadImageSlider";
import MillatEditor from "../../components/sliders/JodiEditor";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Link from "next/link";

const AddNewEvent = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [open, setOpen] = React.useState(false);
  const [photo, setPhoto] = useState<TPhoto | null>(null);
  const [photoId, setPhotoId] = useState("");
  const axiosPublic = useAxiosPublic();

  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  useEffect(() => {
    if (!photoId) {
      return;
    }
    const getData = async () => {
      try {
        const response = await axiosPublic.get(`/photos/${photoId}`);
        setPhoto(response.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, [photoId, axiosPublic]);

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: Partial<TEvent> }) => {
      const response = await apiClient.post(`/events/create-event`, data);
      if (response.data.success === true) {
        toast.success(response.data.message);
        setTitle("");
        setShortDescription("");
        setDescription("");
        setLocation("");
        setDate("");
        setPhotoId("");
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Failed to create event");
      console.error("Update error:", error);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: {
    preventDefault: () => void;
    target: any;
  }) => {
    e.preventDefault();
    if (!photoId) {
      toast.error("photo is required");
      return;
    }
    const imageUrl = photo?.imageUrl as string;
    const data: Partial<TEvent> = {
      title,
      shortDescription,
      description,
      date,
      location,
      imageUrl,
    };

    createMutation.mutate({ data });

    console.log(data);
  };

  return (
    <div className=" h-full w-full  ">
      <Link href={"/dashboard/Events"}>
        <button className="text-rose-600 px-3 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white ">
          <span className="  text-xl ">
            <FaArrowAltCircleRight />
          </span>{" "}
          <p>Back</p>
        </button>
      </Link>

      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <div className="w-full flex justify-center items-center">
        <form onSubmit={handleSubmit}>
          <div className="max-w-4xl 2xl:mt-28 px-6 pt-10 flex flex-col  gap-10 justify-between items-center pb-20 text-black">
            {/* input field  */}
            <section className="flex flex-col justify-between lg:flex-row gap-16 w-full h-auto lg:h-[220px]">
              {/* image,  */}
              <div className=" lg:w-1/2 w-full h-full">
                {photoId ? (
                  <div className="w-full flex justify-center">
                    <div className="w-[150px] h-[150px]  rounded-full relative">
                      <CiCircleRemove
                        onClick={() => setPhotoId("")}
                        className="absolute text-red-600 text-4xl hover:text-red-800 active:scale-90 right-0 top-0"
                      />
                      <Image
                        alt="photo"
                        src={photo?.imageUrl as string}
                        height={600}
                        width={800}
                        className="w-[150px] h-[150px]  rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <label aria-required htmlFor="upload Image">
                    <div
                      onClick={() => toggleDrawer(true)}
                      className="flex items-center flex-col justify-center p-5 border-2  h-[150px] lg:h-full"
                    >
                      <MdAddAPhoto className="text-5xl mb-2" />
                      <p>Upload Image</p>
                    </div>
                  </label>
                )}
              </div>
              {/* title , location and date field */}
              <div className="lg:w-1/2 w-full h-full flex flex-col gap-[20px]">
                <TextField
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  name="title"
                  className=" w-full bg-white"
                  id="outlined-basic"
                  label="Title"
                  variant="outlined"
                />

                <TextField
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  name="location"
                  className=" w-full bg-white text-black"
                  id="outlined-basic"
                  label="Location"
                  variant="outlined"
                />

                <label htmlFor="date">
                  <p className="text-gray-950 mb-1">Select Event Date</p>
                  <input
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    name="date"
                    id="date"
                    className=" w-full bg-white py-3  text-gray-700  px-3"
                  />
                </label>

              </div>
            </section>
            {/* short description, description field  */}
            <div className="w-full bg-white ">
              <TextField
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                name="shortDescription"
                className=" w-full bg-white mb-6"
                id="outlined-basic"
                label="Short Description"
                variant="outlined"
              />

              <MillatEditor
                name="description"
                value={description}
                onChange={setDescription}
              />
            </div>

            <input
              type="submit"
              value="Submit"
              className=" text-white  bg-orange-600 py-2 px-3 active:scale-95 w-full"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewEvent;
