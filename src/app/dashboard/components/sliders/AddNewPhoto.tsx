/* eslint-disable @typescript-eslint/no-explicit-any */
import { Drawer, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import UploadImageSlider from "./uploadImageSlider/UploadImageSlider";
import useAxiosPublic from "@/axios/useAxiosPublic";
import Image from "next/image";
import { TGallery, TPhoto } from "@/types/types";
import { CiCircleRemove } from "react-icons/ci";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const AddNewPhoto = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
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
    mutationFn: async ({ data }: { data: Partial<TGallery> }) => {
      const response = await apiClient.post(`/gallery/create-gallery`, data);
      if (response.data.success === true) {
        toast.success(response.data.message);
        setTitle("");
        setDate("");
        setPhotoId("");
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Failed to add photo");
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
    const data: Partial<TGallery> = {
      title,
      date,
      imageUrl,
    };

    createMutation.mutate({ data });
  };

  return (
    <div className=" h-full min-h-[500px] ">
      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl 2xl:mt-28 px-6 pt-10 flex flex-col  gap-10 justify-between items-center pb-20">
          {/* input field  */}
          <section className="flex flex-col lg:flex-row gap-16">
            {/* image, title and date field  */}
            <div className="flex flex-col gap-[20px]">
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
                    className="flex items-center flex-col justify-center p-5 border-2 bg-white h-[150px]"
                  >
                    <MdAddAPhoto className="text-5xl mb-2" />
                    <p>Upload Image</p>
                  </div>
                </label>
              )}

              <TextField
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                name="title"
                className="md:w-[350px] w-[250px] bg-white"
                id="outlined-basic"
                label="Title"
                variant="outlined"
              />

              <label htmlFor="date">
                <p className="text-gray-950 mb-1">Select Date</p>
                <input
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  name="publishedDate"
                  className="md:w-[350px] w-[250px] bg-white py-3  text-gray-700  px-3"
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

export default AddNewPhoto;
