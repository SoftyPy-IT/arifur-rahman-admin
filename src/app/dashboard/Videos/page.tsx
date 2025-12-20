/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Videos.tsx
"use client";
import Image from "next/image";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { BiSolidEditAlt } from "react-icons/bi";
import { useEffect, useState } from "react";
import {
  FaArrowAltCircleDown,
  FaArrowAltCircleRight,
  FaFileExcel,
} from "react-icons/fa";
import { MdAddBox, MdDelete } from "react-icons/md";
import { Pagination, Stack } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "@/axios/useAxiosPublic";
import apiClient from "@/axios/axiosInstant";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { TVideo } from "@/types/types";
import AddMediaVideo from "../components/sliders/AddMediaVideo";
import UpdateMediaVideo from "../components/sliders/UpdateMediaVideo";
import ReactPlayer from "react-player";
import { videoFolder } from "@/utils/folderOption";

const Videos = () => {
  const [updateVideoId, setUpdateVideoId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedType, setSelectedType] = useState<
    "all" | "youtube" | "facebook"
  >("all");
  const limit = 6;
  const queryClient = useQueryClient();
  const axiosPublic = useAxiosPublic();
  const [openModalForAdd, setOpenModalForAdd] = useState<boolean>(false);
  const [openModalForUpdate, setOpenModalForUpdate] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Build query parameters
  const buildQueryParams = () => {
    const params: any = {
      page: currentPage,
      limit: limit,
    };

    if (selectedFolder !== "all") {
      params.folder = selectedFolder;
    }

    if (selectedType !== "all") {
      params.videoType = selectedType;
    }

    return params;
  };

  // Getting videos
  const { data: videoData = { data: [], totalCount: 0 }, isLoading } = useQuery(
    {
      queryKey: ["videos", currentPage, selectedFolder, selectedType],
      queryFn: async () => {
        const params = buildQueryParams();
        const response = await axiosPublic.get(
          `/videos`, // This will become /api/v1/videos
          { params }
        );
        return response.data.data;
      },
    }
  );

  const { data, totalCount } = videoData;

  // Delete video
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/videos/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video deleted successfully");
    },
    onError: (error: any) => {
      console.log(error);
      toast.error("Failed to delete video");
    },
  });

  return (
    <div className="bg-white">
      <div className="relative ">
        {/* Slider for add video */}
        <div
          className={`transition-transform duration-500 w-full lg:w-4/5 shadow-lg h-full z-10 overflow-y-auto fixed ${
            openModalForAdd
              ? "translate-y-0 top-[60px] bg-gray-100"
              : "translate-y-[100%] "
          } flex justify-center bg-[url(/Images/bg-image-modal-2.jpg)] bg-cover bg-center`}
        >
          <div className="mt-8">
            <button
              onClick={() => setOpenModalForAdd(!openModalForAdd)}
              className="text-rose-600 px-3 absolute top-0 left-0 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white"
            >
              <span className="text-xl">
                <FaArrowAltCircleDown />
              </span>{" "}
              <p>Back</p>
            </button>
            <AddMediaVideo />
          </div>
        </div>

        {/* Slider for update video */}
        <div
          className={`transition-transform duration-500 w-full lg:w-4/5 shadow-lg h-full z-10 overflow-y-auto fixed ${
            openModalForUpdate
              ? "translate-x-0 top-[60px] bg-gray-100"
              : "translate-x-[100%] "
          } flex justify-center bg-[url(/Images/bg-image-modal-2.jpg)] bg-cover bg-center`}
        >
          <div className="mt-8">
            <button
              onClick={() => {
                setOpenModalForUpdate(!openModalForUpdate);
              }}
              className="text-rose-600 px-3 py-1 border border-rose-600 flex flex-row active:scale-95 gap-2 item-center justify-center bg-white absolute left-0 top-0"
            >
              <span className="text-xl">
                <FaArrowAltCircleRight />
              </span>{" "}
              <p>Back</p>
            </button>
            <UpdateMediaVideo
              videoId={updateVideoId}
              setOpenModalForUpdate={setOpenModalForUpdate}
            />
          </div>
        </div>
      </div>

      {/* Header section */}
      <div className="mt-5 mx-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="lg:text-4xl text-xl font-semibold text-orange-500">
              Videos
            </h1>
            <p className="text-gray-600">Manage your video content</p>
          </div>
          <button
            onClick={() => setOpenModalForAdd(!openModalForAdd)}
            className="active:scale-95 text-xl text-white p-3 bg-gray-600 hover:bg-slate-800 flex gap-2 items-center px-6 rounded-lg"
          >
            <MdAddBox />
            Add New Video
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Filter by Folder
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => {
                setSelectedFolder(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
            >
              {videoFolder.map((item) => (
                <option key={item.folder} value={item.folder}>
                  {item.folder}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table section */}
      <section className="mx-8">
        {isLoading ? (
          <div className="w-full flex justify-center mt-28">
            <Image
              alt="photo"
              src="/Images/loading.gif"
              height={600}
              width={800}
              className="w-[80px] h-[80px]"
            />
          </div>
        ) : (
          <section className="flex justify-center item-center px-5 py-8">
            {data?.length === 0 ? (
              <div className="flex flex-col items-center px-5 my-24">
                <FaFileExcel className="text-6xl text-gray-400" />
                <p className="text-2xl text-gray-600 mt-4">No videos found.</p>
                <p className="text-gray-500">
                  Try changing your filters or add a new video.
                </p>
              </div>
            ) : (
              <TableContainer component={Paper} sx={{ maxWidth: "100%" }}>
                <Table
                  sx={{ width: "100%", border: "2px solid #e5e7eb" }}
                  aria-label="videos table"
                >
                  <TableHead className="bg-blue-100 border-b-2 border-gray-300">
                    <TableRow>
                      <TableCell className="font-semibold text-gray-900">
                        SL
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        Video
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        Title
                      </TableCell>
                      {/* <TableCell className="font-semibold text-gray-900">Type</TableCell> */}
                      {/* <TableCell className="font-semibold text-gray-900">Folder</TableCell> */}
                      <TableCell className="font-semibold text-gray-900">
                        Created
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.map((row: TVideo, idx: number) => (
                      <TableRow
                        key={row._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": { backgroundColor: "#f9fafb" },
                        }}
                      >
                        <TableCell>
                          <span className="font-medium">{idx + 1}</span>
                        </TableCell>
                        <TableCell>
                          {isClient && (
                            <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-200 bg-black">
                              {/* Check if it's Facebook video */}
                              {row.videoUrl.includes("facebook.com") ||
                              row.videoUrl.includes("fb.watch") ? (
                                // Facebook video - use iframe for consistent controls
                                <iframe
                                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                                    row.videoUrl
                                  )}&show_text=false&width=267&height=150`}
                                  width="100%"
                                  height="100%"
                                  style={{ border: "none", overflow: "hidden" }}
                                  scrolling="no"
                                  frameBorder="0"
                                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                  allowFullScreen={true}
                                  title="Facebook video player"
                                />
                              ) : (
                                // YouTube and other videos - use ReactPlayer
                                <ReactPlayer
                                  url={row.videoUrl}
                                  width="100%"
                                  height="100%"
                                  controls={true}
                                  muted={true}
                                  playing={false}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                  }}
                                  config={{
                                    youtube: {
                                      playerVars: {
                                        modestbranding: 1,
                                        rel: 0,
                                        showinfo: 0,
                                        controls: 1,
                                      },
                                    },
                                    vimeo: {
                                      playerOptions: {
                                        controls: true,
                                      },
                                    },
                                  }}
                                />
                              )}

                              {/* Platform badge */}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <span className="font-medium">
                              {row.title || "No Title"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-gray-600">
                            {new Date(row.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setOpenModalForUpdate(!openModalForUpdate);
                                setUpdateVideoId(row._id);
                              }}
                              className="active:scale-95 text-xl text-white p-2 bg-blue-500 flex gap-1 items-center rounded-full hover:bg-blue-600 transition-colors"
                              title="Edit"
                            >
                              <BiSolidEditAlt />
                            </button>
                            <button
                              onClick={() =>
                                Swal.fire({
                                  title: "Are you sure?",
                                  text: "This video will be permanently deleted!",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#d33",
                                  cancelButtonColor: "#3085d6",
                                  confirmButtonText: "Yes, delete it!",
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    deleteMutation.mutate(row._id);
                                  }
                                })
                              }
                              className="bg-rose-600 p-2 text-xl rounded-full text-white active:scale-90 hover:bg-red-700 transition-colors"
                              title="Delete"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </section>
        )}
      </section>

      {/* Pagination buttons */}
      {totalCount > limit && (
        <div className="flex item-center justify-center mb-20 mt-8">
          <Stack spacing={2}>
            <Pagination
              count={Math.ceil(totalCount / limit)}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
              size="large"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default Videos;
