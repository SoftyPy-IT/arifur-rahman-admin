/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TItem } from "@/types/types";
import { TextField } from "@mui/material";

const AddNewBiographyItem = ({ id }: { id: string }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async ({ data }: { data: Partial<TItem> }) => {
      const response = await apiClient.patch(`/biography/${id}`, {
        items: [data],
      });
      if (response.data.success === true) {
        toast.success("Added Successfully");
        setTitle("");
        setDescription("");
      }
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biography"] });
    },
    onError: (error: any) => {
      toast.error(error.response.data.message || "Failed to create");
      console.error("Update error:", error);
    },
  });

  const handleSubmit = async (e: {
    preventDefault: () => void;
    target: any;
  }) => {
    e.preventDefault();

    const data: Partial<TItem> = {
      action: "add",
      itemTitle: title,
      itemDescription: description,
    };

    createMutation.mutate({ data });

    console.log(data);
  };

  return (
    <div className=" h-full min-h-[500px] ">
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl 2xl:mt-28 px-6 pt-10 flex flex-col  gap-10 justify-between items-center pb-20">
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:w-[400px] lg:w-[500px] w-[280px] bg-white"
            id="outlined-basic"
            label="Item Title"
            variant="outlined"
          />
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:w-[400px] w-[280px] lg:w-[500px] bg-white"
            id="outlined-multiline-static"
            label="Item Description"
            multiline
            rows={8}
          />
          <input
            type="submit"
            value="Submit"
            className="md:w-[400px] lg:w-[500px] text-white w-[280px] bg-orange-600 py-2 px-3 active:scale-95"
          />
        </div>
      </form>
    </div>
  );
};

export default AddNewBiographyItem;
