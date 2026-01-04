/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Drawer, TextField } from "@mui/material";
import { MdAddAPhoto } from "react-icons/md";
import { CiCircleRemove } from "react-icons/ci";
import { FaArrowAltCircleRight } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAxiosPublic from "@/axios/useAxiosPublic";
import apiClient from "@/axios/axiosInstant";
import { TManifesto, TPhoto } from "@/types/types";
import UploadImageSlider from "@/app/dashboard/components/sliders/uploadImageSlider/UploadImageSlider";
import MillatEditor from "@/app/dashboard/components/sliders/JodiEditor";

const AddNewManifesto = () => {
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [photo, setPhoto] = useState<TPhoto | null>(null);
  const [photoId, setPhotoId] = useState("");
  const [open, setOpen] = useState(false);
  const [pdfLinks, setPdfLinks] = useState<{ name: string; url: string }[]>([]);

  const toggleDrawer = (newOpen: boolean) => setOpen(newOpen);

  // Fetch photo by photoId
  useEffect(() => {
    if (!photoId) return;
    const getData = async () => {
      try {
        const response = await axiosPublic.get(`/photos/${photoId}`);
        setPhoto(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    getData();
  }, [photoId, axiosPublic]);

  // Mutation to create manifesto
  const createMutation = useMutation({
    mutationFn: async (data: Partial<TManifesto>) => {
      const response = await apiClient.post(`/manifestos`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Manifesto created successfully");
      queryClient.invalidateQueries({ queryKey: ["manifestos"] });
      // Reset form
      setTitle("");
      setShortDescription("");
      setDescription("");
      setDate("");
      setPhotoId("");
      setPdfLinks([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create manifesto");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoId) {
      toast.error("Photo is required");
      return;
    }
    createMutation.mutate({
      title,
      shortDescription,
      description,
      date,
      imageUrl: photo?.imageUrl,
      pdfLinks, 
    });
  };

  return (
    <div className="h-full w-full text-black">
      {/* Back button */}
      <Link href="/dashboard/Manifesto">
        <button className="text-rose-600 px-3 py-1 border border-rose-600 flex items-center gap-2 bg-white active:scale-95">
          <FaArrowAltCircleRight /> Back
        </button>
      </Link>

      {/* Image Upload Drawer */}
      <Drawer open={open} onClose={() => toggleDrawer(false)}>
        <UploadImageSlider photoId={setPhotoId} toggleDrawer={toggleDrawer} />
      </Drawer>

      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto mt-10 flex flex-col gap-10">
          {/* Top Section: Photo + Title + Date */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Photo */}
            <div className="lg:w-1/2 w-full flex justify-center">
              {photoId ? (
                <div className="relative w-[150px] h-[150px]">
                  <CiCircleRemove
                    className="absolute top-0 right-0 text-red-600 text-3xl cursor-pointer"
                    onClick={() => setPhotoId("")}
                  />
                  <Image
                    src={photo?.imageUrl as string}
                    alt="Manifesto"
                    width={150}
                    height={150}
                    className="rounded-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-[150px] h-[150px] flex flex-col items-center justify-center border-2 cursor-pointer"
                  onClick={() => toggleDrawer(true)}
                >
                  <MdAddAPhoto className="text-4xl mb-2" />
                  Upload Image
                </div>
              )}
            </div>

            {/* Title + Date */}
            <div className="lg:w-1/2 w-full flex flex-col gap-4">
              <TextField
                required
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>
                Date
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border px-3 py-2 mt-1"
                />
              </label>
            </div>
          </div>

          {/* Short Description */}
          <TextField
            required
            label="Short Description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />

          {/* Description (Rich Text) */}
          <MillatEditor
            value={description}
            onChange={setDescription}
            name="description"
          />

          {/* PDF Links */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold">PDF Links</h3>
            {pdfLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Name"
                  value={link.name}
                  onChange={(e) => {
                    const newLinks = [...pdfLinks];
                    newLinks[index].name = e.target.value;
                    setPdfLinks(newLinks);
                  }}
                  className="border px-2 py-1 w-1/3"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...pdfLinks];
                    newLinks[index].url = e.target.value;
                    setPdfLinks(newLinks);
                  }}
                  className="border px-2 py-1 w-2/3"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPdfLinks(pdfLinks.filter((_, i) => i !== index))
                  }
                  className="text-red-600 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setPdfLinks([...pdfLinks, { name: "", url: "" }])}
              className="bg-blue-600 text-white px-2 py-1 mt-2 w-1/4"
            >
              Add PDF
            </button>
          </div>

          {/* Submit Button */}
          <input
            type="submit"
            value="Submit"
            className="bg-orange-600 text-white py-2 px-3 cursor-pointer w-1/4 mt-4"
          />
        </div>
      </form>
    </div>
  );
};

export default AddNewManifesto;
