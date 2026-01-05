/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Drawer, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdAddAPhoto } from "react-icons/md";
import useAxiosPublic from "@/axios/useAxiosPublic";
import Image from "next/image";
import { TArticle, TPhoto } from "@/types/types";
import { CiCircleRemove } from "react-icons/ci";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import UploadImageSlider from "../../components/sliders/uploadImageSlider/UploadImageSlider";
import MillatEditor from "../../components/sliders/JodiEditor";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import Link from "next/link";

const AddNewArticle = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
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
    mutationFn: async ({ data }: { data: Partial<TArticle> }) => {
      const response = await apiClient.post(`/articles/create-article`, data);
      if (response.data.success === true) {
        toast.success(response.data.message);
        setTitle("");
        setShortDescription("");
        setDescription("");
        setPublishedDate("");
        setPhotoId("");
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Failed to publish article");
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
    const data: Partial<TArticle> = {
      title,
      shortDescription,
      description,
      publishedDate,
      imageUrl,
    };

    createMutation.mutate({ data });
  };

  return (
    <div className=" h-full  ">
      <Link href={"/dashboard/Articles"}>
        <button className="text-rose-600 px-3  py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white">
          <span className=" text-xl">
            <FaArrowAltCircleLeft />
          </span>{" "}
          <p>Back</p>
        </button>
      </Link>

      <div>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
        </Drawer>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="w-full 2xl:mt-28 px-6 pt-10 flex flex-col  gap-10 justify-between items-center pb-20 text-black">
          {/* input field  */}
          <div className="flex flex-col lg:flex-row  gap-[20px] w-full">
            {/* image  */}
            <div className="w-full">
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
                    className="flex items-center flex-col justify-center p-5 border-2 bg-white h-[180px]"
                  >
                    <MdAddAPhoto className="text-5xl mb-2" />
                    <p>Upload Image</p>
                  </div>
                </label>
              )}
            </div>

            <div className="w-full ">
              <TextField
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                name="title"
                className="w-full mb-5 bg-white"
                id="outlined-basic"
                label="Title"
                variant="outlined"
              /> 

              <label htmlFor="date">
                <p className="text-gray-950 mb-2">Select published Date</p>
                <input
                  required
                  value={publishedDate}
                  onChange={(e) => setPublishedDate(e.target.value)}
                  type="date"
                  name="publishedDate"
                  className="w-full bg-white py-3  text-gray-700  px-3"
                />
              </label>
            </div>
          </div>

          {/*  description field  */}
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
            className="md:w-[350px] text-white w-[250px] bg-orange-600 py-2 px-3 active:scale-95 lg:w-full"
          />
        </div>
      </form>
    </div>
  );
};

export default AddNewArticle;
